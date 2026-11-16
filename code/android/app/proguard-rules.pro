# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# react-native-reanimated
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }

# Add any project specific keep options here:

# R8 shrinks and obfuscates release builds without optimizing them. AGP 9 accepts only the
# proguard-android-optimize.txt preset, and the keep rules here and in the libraries are untested
# with optimization (Yandex MapKit, ONNX Runtime JNI, MMKV, the app's own modules).
-dontoptimize

# @generated begin expo-build-properties - expo prebuild (DO NOT MODIFY)
# React Native view managers of the Yandex map fork are looked up by name.
-keep class com.yamaplite.** { *; }
# MMKV and the app's own Expo modules are called from native/JSI code.
-keep class com.margelo.** { *; }
-keep class expo.modules.applocale.** { *; }
-keep class expo.modules.appkeys.** { *; }
-keep class expo.modules.screencapture.** { *; }
-keep class expo.modules.windowregion.** { *; }
-keep class expo.modules.colorizer.** { *; }
# ONNX Runtime's Java classes are created and read from its native library.
-keep class ai.onnxruntime.** { *; }
# expo-camera is built from source with the barcode and document scanners disabled: their
# ML Kit references stay in the bytecode but are never reached.
-dontwarn com.google.mlkit.**
# WorkManager (pulled in by react-native-maps) creates its Room database and input mergers by
# reflection at app start. Their library rules keep the classes but not the no-arg constructors,
# which R8 strips if android.r8.strictFullModeForKeepRules is turned on in gradle.properties.
-keep class * extends androidx.room.RoomDatabase { <init>(); }
-keep class * extends androidx.work.InputMerger { <init>(); }
# @generated end expo-build-properties