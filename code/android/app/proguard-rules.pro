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

# @generated begin expo-build-properties - expo prebuild (DO NOT MODIFY)
# React Native view managers of the Yandex map fork are looked up by name.
-keep class com.yamaplite.** { *; }
# MMKV and the app's own Expo modules are called from native/JSI code.
-keep class com.margelo.** { *; }
-keep class expo.modules.applocale.** { *; }
-keep class expo.modules.appkeys.** { *; }
-keep class expo.modules.screencapture.** { *; }
-keep class expo.modules.windowregion.** { *; }
# expo-camera is built from source with the barcode scanner disabled: its ML Kit
# references stay in the bytecode but are never reached.
-dontwarn com.google.mlkit.**
# @generated end expo-build-properties