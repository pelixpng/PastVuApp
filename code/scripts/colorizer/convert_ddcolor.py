#!/usr/bin/env python3
"""Builds the on-device colorization model for iOS from DDColor-L (ddcolor_modelscope).

"DDColor: Towards Photo-Realistic Image Colorization via Dual Decoders" (Kang et al., ICCV 2023),
the release its authors recommend for real-world photos. The photo's lightness goes in as a grey
image at 512x512; its colour (a, b of CIE Lab) comes out at the same size. The app stretches that
colour over the full-size lightness of the original (modules/colorizer/ios).

The lighter models tried first, Zhang et al. 2017 and DDColor-T, left many old photos brownish or
grey, so only this one is built.

Code and weights: https://github.com/piddnad/DDColor, Apache License 2.0. The weights here are
converted to Core ML and quantized to 8 bits, which the licence asks to be stated.

Needs torch, coremltools and opencv (Python 3.9-3.12), the DDColor repository and its weights; the
conversion takes about 6 GB of memory:
    venv/bin/pip install torch==2.5.1 coremltools==8.3.0 "numpy<2" pillow "opencv-python-headless<4.11"
    curl -L -o ddcolor_modelscope.pth \
      https://huggingface.co/piddnad/DDColor-models/resolve/main/ddcolor_modelscope.pth
    venv/bin/python convert_ddcolor.py --repo <DDColor checkout> --weights ddcolor_modelscope.pth

Writes Colorizer.mlpackage (8-bit weights, iOS 16+, about 225 MB). The app does not bundle it: it is
zipped, the package at the archive's root, as Colorizer.mlpackage.zip and uploaded to
huggingface.co/pelixpng/pastvu-colorizer. The app downloads it on first use (pinned commit and
SHA-256 in core/store/ColorizerModel.store.ts) and compiles it on device
(modules/colorizer/ios/ModelStore.swift).
"""
import argparse
import os
import sys
import types

import numpy as np
import torch
from torch import nn
from PIL import Image

SIZE = 512

# --- CIE Lab, sRGB with a D65 white: the same maths as the Swift module ------------------------

WHITE = np.array([0.95047, 1.0, 1.08883])
RGB_TO_XYZ = np.array([[0.4124564, 0.3575761, 0.1804375],
                       [0.2126729, 0.7151522, 0.0721750],
                       [0.0193339, 0.1191920, 0.9503041]])
XYZ_TO_RGB = np.linalg.inv(RGB_TO_XYZ)


def srgb_to_linear(v):
    return np.where(v <= 0.04045, v / 12.92, ((v + 0.055) / 1.055) ** 2.4)


def linear_to_srgb(v):
    return np.where(v <= 0.0031308, v * 12.92, 1.055 * np.power(np.clip(v, 0, None), 1 / 2.4) - 0.055)


def lightness(rgb):
    """L of CIE Lab for an RGB image with values in 0..1."""
    y = srgb_to_linear(rgb) @ RGB_TO_XYZ[1]
    f = np.where(y > (6 / 29) ** 3, np.cbrt(y), y / (3 * (6 / 29) ** 2) + 4 / 29)
    return 116 * f - 16


def lab_to_srgb(l, a, b):
    fy = (l + 16) / 116
    fx = fy + a / 500
    fz = fy - b / 200

    def finv(t):
        return np.where(t > 6 / 29, t ** 3, 3 * (6 / 29) ** 2 * (t - 4 / 29))

    xyz = np.stack([finv(fx), finv(fy), finv(fz)], axis=-1) * WHITE
    return np.clip(linear_to_srgb(xyz @ XYZ_TO_RGB.T), 0, 1)


def load_ddcolor(repo, weights):
    """DDColor-L with its released weights, skipping the training-only parts of the repo."""
    # basicsr's package initialisers import its training utilities (torchvision, lmdb...); the
    # model needs none of them, so the packages are registered without running those files.
    for name, path in (('basicsr', f'{repo}/basicsr'), ('basicsr.archs', f'{repo}/basicsr/archs')):
        module = types.ModuleType(name)
        module.__path__ = [path]
        sys.modules[name] = module
    sys.path.insert(0, repo)
    from ddcolor.model import DDColor

    model = DDColor(
        encoder_name='convnext-l',  # 228M parameters
        decoder_name='MultiScaleColorDecoder',
        input_size=[SIZE, SIZE],
        num_output_channels=2,
        last_norm='Spectral',
        do_normalize=False,
        num_queries=100,
        num_scales=3,
        dec_layers=9,
    )
    checkpoint = torch.load(weights, map_location='cpu', weights_only=True)
    model.load_state_dict(checkpoint.get('params', checkpoint), strict=False)
    return model.eval()


class GreyIn(nn.Module):
    """One grey channel in, a and b out. DDColor takes the grey as RGB and normalises it itself."""

    def __init__(self, model):
        super().__init__()
        self.model = model

    def forward(self, grey):
        return self.model(grey.repeat(1, 3, 1, 1))


def grey_from_lightness(l):
    """The neutral sRGB grey with lightness L: what DDColor's pipeline feeds the model."""
    return lab_to_srgb(l, np.zeros_like(l), np.zeros_like(l))[..., 0]


def colorize_file(predict, src, dst):
    image = Image.open(src).convert('RGB')
    rgb = np.asarray(image).astype(np.float64) / 255
    small = np.asarray(image.resize((SIZE, SIZE), Image.BILINEAR)).astype(np.float64) / 255
    grey = grey_from_lightness(lightness(small))[None, None].astype(np.float32)
    ab = predict(grey)[0]  # 2 x 512 x 512
    h, w = rgb.shape[:2]
    ab_full = [np.asarray(Image.fromarray(ab[i].astype(np.float32)).resize((w, h), Image.BILINEAR)) for i in range(2)]
    out = lab_to_srgb(lightness(rgb), ab_full[0], ab_full[1])
    Image.fromarray((out * 255).round().astype(np.uint8)).save(dst, quality=92)
    print('wrote', dst)


def main():
    import coremltools as ct

    parser = argparse.ArgumentParser()
    parser.add_argument('--repo', required=True, help='DDColor checkout')
    parser.add_argument('--weights', required=True, help='ddcolor_modelscope.pth')
    parser.add_argument('--out', default='.')
    parser.add_argument('--fp16', action='store_true', help='also write a half-precision model')
    parser.add_argument('--test', nargs='*', default=[], help='photos to colourize with each model')
    args = parser.parse_args()

    model = GreyIn(load_ddcolor(args.repo, args.weights)).eval()
    with torch.no_grad():
        traced = torch.jit.trace(model, torch.rand(1, 1, SIZE, SIZE))

    mlmodel = ct.convert(
        traced,
        # Float32 in and out, half precision inside: the app never needs Float16, which the x86_64
        # slice of a simulator build does not have.
        inputs=[ct.TensorType(name='grey', shape=(1, 1, SIZE, SIZE), dtype=np.float32)],
        outputs=[ct.TensorType(name='ab', dtype=np.float32)],
        convert_to='mlprogram',
        compute_precision=ct.precision.FLOAT16,
        minimum_deployment_target=ct.target.iOS16,
    )
    models = {'fp16': mlmodel} if args.fp16 else {}
    # Asymmetric: symmetric 8-bit weights broke DDColor (cyan blotches, 15-31/255 off the PyTorch
    # colours), while these stay within 1/255 of half precision.
    config = ct.optimize.coreml.OptimizationConfig(
        global_config=ct.optimize.coreml.OpLinearQuantizerConfig(mode='linear')
    )
    models['int8'] = ct.optimize.coreml.linear_quantize_weights(mlmodel, config=config)

    for name, m in models.items():
        m.short_description = 'Colorizes a photo from its lightness (DDColor-L, Apache-2.0, converted and quantized).'
        path = os.path.join(args.out, 'Colorizer.mlpackage' if name == 'int8' else f'Colorizer-{name}.mlpackage')
        m.save(path)
        print('saved', path)
        for src in args.test:
            base = os.path.splitext(os.path.basename(src))[0]
            colorize_file(lambda g: m.predict({'grey': g})['ab'], src, os.path.join(args.out, f'{base}-ddcolor-{name}.jpg'))

    for src in args.test:
        base = os.path.splitext(os.path.basename(src))[0]
        with torch.no_grad():
            colorize_file(lambda g: model(torch.from_numpy(g)).numpy(), src, os.path.join(args.out, f'{base}-ddcolor-torch.jpg'))


if __name__ == '__main__':
    main()
