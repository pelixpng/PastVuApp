package com.pelixpng.PastVuApp
import expo.modules.splashscreen.SplashScreenManager

import android.content.pm.ActivityInfo
import android.content.res.Configuration
import android.graphics.Point
import android.os.Build
import android.os.Bundle
import android.util.DisplayMetrics
import kotlin.math.min

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

import expo.modules.ReactActivityDelegateWrapper

class MainActivity : ReactActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    // Set the theme to AppTheme BEFORE onCreate to support
    // coloring the background, status bar, and navigation bar.
    // This is required for expo-splash-screen.
    // setTheme(R.style.AppTheme);
    // @generated begin expo-splashscreen - expo prebuild (DO NOT MODIFY) sync-f3ff59a738c56c9a6119210cb55f0b613eb8b6af
    SplashScreenManager.registerOnActivity(this)
    // @generated end expo-splashscreen
    super.onCreate(null)
    lockPhonesToPortrait(resources.configuration)
  }

  /**
   * A foldable moves between its screens without being recreated (configChanges in the manifest),
   * keeping the orientation asked for on the other one. Asked again, folded it gets the phone's
   * lock and unfolded none, which Android 15 and earlier honour on the inner screen too.
   */
  override fun onConfigurationChanged(newConfig: Configuration) {
    super.onConfigurationChanged(newConfig)
    lockPhonesToPortrait(newConfig)
  }

  /**
   * Phones stay upright and tablets turn freely. A phone's screen is under 600 dp on its shorter
   * side, the line at which App.tsx shows the phone's interface (ANDROID_TABLET_MIN_WIDTH).
   */
  private fun lockPhonesToPortrait(config: Configuration) {
    val orientation =
      if (screenSmallestWidthDp(config) < 600f) ActivityInfo.SCREEN_ORIENTATION_PORTRAIT
      else ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED
    if (requestedOrientation != orientation) requestedOrientation = orientation
  }

  /**
   * The shorter side of the screen the activity is on, in dp. The screen's, not the window's: a
   * split-screen window turns with the screen anyway, and a window boxed upright by the lock on an
   * unfolded inner screen could measure under the line and keep itself locked.
   */
  private fun screenSmallestWidthDp(config: Configuration): Float {
    val density = config.densityDpi.toFloat() / DisplayMetrics.DENSITY_DEFAULT
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.R) {
      // Not the configuration's smallest width: in split-screen it is the window's there.
      val size = Point()
      @Suppress("DEPRECATION")
      windowManager.defaultDisplay.getRealSize(size)
      return min(size.x, size.y) / density
    }
    val bounds = windowManager.maximumWindowMetrics.bounds
    return min(bounds.width(), bounds.height()) / density
  }

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "main"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate {
    return ReactActivityDelegateWrapper(
          this,
          BuildConfig.IS_NEW_ARCHITECTURE_ENABLED,
          object : DefaultReactActivityDelegate(
              this,
              mainComponentName,
              fabricEnabled
          ){})
  }

  /**
    * Align the back button behavior with Android S
    * where moving root activities to background instead of finishing activities.
    * @see <a href="https://developer.android.com/reference/android/app/Activity#onBackPressed()">onBackPressed</a>
    */
  override fun invokeDefaultOnBackPressed() {
      if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.R) {
          if (!moveTaskToBack(false)) {
              // For non-root activities, use the default implementation to finish them.
              super.invokeDefaultOnBackPressed()
          }
          return
      }

      // Use the default back button implementation on Android S
      // because it's doing more than [Activity.moveTaskToBack] in fact.
      super.invokeDefaultOnBackPressed()
  }
}
