"""Builds the Android colorization model: DDColor-L for ONNX Runtime (the iOS model is built by
../convert_ddcolor.py). Three steps, each a script here:

    # 1. Export, with the decoder's tail in 8 strips (needs torch and the DDColor checkout and
    #    weights, as for iOS; about 2 GB of memory). Writes ddcolor-tiled-fp32.onnx (912 MB).
    python export_onnx.py <folder with ddcolor/ and ddcolor_modelscope.pth> 8
    # 2. The MatMul weights to 8 bits, asymmetric, blocks of 128 (onnxruntime >= 1.30, onnx_ir).
    python quantize_matmuls.py ddcolor-tiled-fp32.onnx ddcolor-tiled-nb.onnx
    # 3. The remaining Conv weights to 8 bits, asymmetric, per output channel.
    python quantize_convs.py ddcolor-tiled-nb.onnx colorizer-android.onnx Conv

The result (241 MB) stays within 0.25 on average of PyTorch's colours, and running it takes about
0.3-0.4 GB on top of the app with the CPU arena off (PhotoColorizer.kt). The app downloads it from
huggingface.co/pelixpng/pastvu-colorizer (core/store/ColorizerModel.store.ts).

Spectral norm is folded into the weights first: in eval mode it divides each decoder weight by a
constant, which ONNX would otherwise recompute every run while storing the weight twice.

DDColor-L for ONNX Runtime with the decoder's tail computed in horizontal strips.

After the small decoder, everything up to the output is per pixel, except a 2x2 blur that looks
one row up: a 1x1 conv to 4096 channels at 128x128, pixel shuffle to 256x512x512, the blur, the
dot product with the 100 colour queries and the final 1x1 conv. Whole, that tail holds two or
three 268 MB tensors at once; in strips, an eighth of that. The result is the same to float
rounding."""
import os
import sys
import torch
import torch.nn.functional as F
from torch import nn
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
from convert_ddcolor import load_ddcolor, GreyIn, SIZE

S, STRIPS = sys.argv[1], int(sys.argv[2])

class Tiled(nn.Module):
    def __init__(self, ddcolor, strips):
        super().__init__()
        self.m, self.strips = ddcolor, strips
        self.embed = []
        ddcolor.decoder.color_decoder.color_embed.register_forward_hook(lambda mod, i, o: self.embed.append(o))

    def forward(self, grey):
        m = self.m
        x = m.normalize(grey.repeat(1, 3, 1, 1))
        m.encoder(x)
        d = m.decoder
        out0 = d.layers[0](d.hooks[-1].feature)
        out1 = d.layers[1](out0)
        out2 = d.layers[2](out1)
        self.embed.clear()
        d.color_decoder([out0, out1, out2], out2[:, :, :1, :1])  # just for the colour queries
        queries = self.embed[-1]  # 1 x 100 x 256
        shuf = d.last_shuf
        rows = out2.shape[2]
        step = rows // self.strips
        pieces, chain = [], None
        for k in range(self.strips):
            r0, r1 = k * step, (k + 1) * step
            part = out2[:, :, max(r0 - 1, 0):r1]
            # A fake dependency on the previous strip, so ONNX Runtime runs the strips one by one.
            if chain is not None:
                part = part + chain
            feat = shuf.shuf(shuf.relu(shuf.conv(part)))
            if r0 == 0:
                feat = F.pad(feat, (1, 0, 1, 0), mode='replicate')
            else:
                feat = F.pad(feat[:, :, 3:], (1, 0, 0, 0), mode='replicate')
            img = shuf.blur(feat)
            colour = torch.einsum('bqc,bchw->bqhw', queries, img)
            out = m.refine_net(torch.cat([colour, x[:, :, 4 * r0:4 * r1]], dim=1))
            pieces.append(out)
            chain = out[:, :1, :1, :1].mean() * 0
        return torch.cat(pieces, dim=2)

ddcolor = load_ddcolor(f'{S}/ddcolor', f'{S}/ddcolor_modelscope.pth')
for module in ddcolor.modules():
    if hasattr(module, 'weight_orig'):
        torch.nn.utils.remove_spectral_norm(module)
whole, tiled = GreyIn(ddcolor).eval(), Tiled(ddcolor, STRIPS).eval()
with torch.no_grad():
    probe = torch.rand(1, 1, SIZE, SIZE)
    print('max difference from the whole model', (whole(probe) - tiled(probe)).abs().max().item())
    torch.onnx.export(tiled, probe, 'ddcolor-tiled-fp32.onnx', input_names=['grey'], output_names=['ab'],
                      opset_version=17, do_constant_folding=True)
print('exported')
