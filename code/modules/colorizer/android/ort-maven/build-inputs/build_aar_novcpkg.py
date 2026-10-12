#!/usr/bin/env python3
# Runs ONNX Runtime's own tools/ci_build/github/android/build_aar_package.py unchanged, except that it
# drops the two flags that script hard-codes into every build.py call (build_aar_package.py:102):
#   --use_vcpkg --use_vcpkg_ms_internal_asset_cache
# The second one points vcpkg at Microsoft's internal asset cache with x-block-origin (build.py:304-319),
# i.e. no fallback to the public download URLs. Without these flags build.py uses CMake FetchContent with the
# public URLs pinned in cmake/deps.txt (and a prebuilt universal protoc for macOS hosts).
# The ORT source tree is not modified.
import os
import runpy
import subprocess
import sys

SCRIPT = os.path.join(
    os.path.dirname(os.path.realpath(__file__)),
    "src", "tools", "ci_build", "github", "android", "build_aar_package.py",
)
_DROP = {"--use_vcpkg", "--use_vcpkg_ms_internal_asset_cache"}
_orig_run = subprocess.run


def _run(cmd, *args, **kwargs):
    if isinstance(cmd, list):
        cmd = [c for c in cmd if c not in _DROP]
    return _orig_run(cmd, *args, **kwargs)


subprocess.run = _run
sys.argv = [SCRIPT, *sys.argv[1:]]
runpy.run_path(SCRIPT, run_name="__main__")
