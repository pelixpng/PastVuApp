# DDColor model

The colorization model this module runs is derived from
**DDColor-L** (`ddcolor_modelscope`), by Xiaoyang Kang, Tao Yang, Wenqi Ouyang, Peiran Ren, Lingzhi Li
and Xuansong Xie: "DDColor: Towards Photo-Realistic Image Colorization via Dual Decoders", ICCV 2023.

- Code and weights: https://github.com/piddnad/DDColor, https://huggingface.co/piddnad/DDColor-models
- Licence: Apache License 2.0, https://www.apache.org/licenses/LICENSE-2.0

It is not shipped with the app: the app downloads it on first use from
https://huggingface.co/pelixpng/pastvu-colorizer, whose model card lists every change in detail.

Changes made for PastVu: both builds take a single grey channel instead of a three-channel grey image,
and their weights are quantized to 8 bits (asymmetric).
- iOS (`Colorizer.mlpackage.zip`): converted to Core ML with `scripts/colorizer/convert_ddcolor.py`,
  computing in half precision inside.
- Android (`colorizer-android.onnx`): exported to ONNX with `scripts/colorizer/android/`, spectral norm
  folded into the weights and the decoder's last upsampling and colour head split into 8 horizontal
  strips (same output, a third of the memory).

The weights were trained by their authors on ImageNet, whose terms of access limit the dataset itself
to non-commercial research.
