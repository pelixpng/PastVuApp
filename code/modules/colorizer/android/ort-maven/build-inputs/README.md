# ONNX Runtime for the colorizer

`../com/microsoft/onnxruntime/onnxruntime-android/1.30.0-pastvu/` holds our own build of ONNX Runtime v1.30.0:
reduced to the operators of the colorizer model (`required_ops_union.config`), built with `--no_telemetry`,
for arm64-v8a and armeabi-v7a (`aar_arm64_armv7.json`). The version `1.30.0-pastvu` exists only here, so the
build fails instead of picking up the stock library from Maven Central.

## Rebuilding

Needs Android NDK 28.0.13004108 and JDK 17. Check out ONNX Runtime v1.30.0 as `src/` next to
`build_aar_novcpkg.py`, then run from this directory:

```sh
python build_aar_novcpkg.py --build_dir build-aar --config Release --android_sdk_path "$ANDROID_HOME" --android_ndk_path "$ANDROID_NDK_HOME" --include_ops_by_config required_ops_union.config aar_arm64_armv7.json
```

`build_aar_novcpkg.py` runs ORT's own `build_aar_package.py` but drops its `--use_vcpkg` flags, so the
dependencies are fetched from the public URLs in ORT's `cmake/deps.txt` instead of Microsoft's internal cache.

Copy the result
`build-aar/aar_out/Release/com/microsoft/onnxruntime/onnxruntime-android/1.30.0/onnxruntime-android-1.30.0.aar`
to `../com/microsoft/onnxruntime/onnxruntime-android/1.30.0-pastvu/onnxruntime-android-1.30.0-pastvu.aar`.
The `.pom` next to it stays as it is.
