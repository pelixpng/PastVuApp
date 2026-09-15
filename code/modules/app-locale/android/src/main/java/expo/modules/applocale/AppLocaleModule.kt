package expo.modules.applocale

import android.content.res.Resources
import androidx.appcompat.app.AppCompatDelegate
import androidx.core.os.LocaleListCompat
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class AppLocaleModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("AppLocale")

    // What the app should run in once its own override is cleared. `AppCompatDelegate` holds that
    // state synchronously, unlike the activity configuration, which still reports the previous
    // language right after a switch. An override set from the system's per-app Language screen
    // shows up here too, so it keeps working.
    Function("getSystemLocale") {
      val applied = AppCompatDelegate.getApplicationLocales()
      if (!applied.isEmpty) {
        applied[0]?.language
      } else {
        val system = Resources.getSystem().configuration.locales
        if (system.isEmpty) null else system[0].language
      }
    }

    // Delegates to the AndroidX per-app language API, which on Android 13+ is backed by the same
    // system setting the OS shows for this app, and is emulated by AppCompat below it. Google Maps
    // renders its labels in the app's locale, so the map follows along.
    Function("setAppLocale") { languageTag: String? ->
      val locales =
        if (languageTag == null) LocaleListCompat.getEmptyLocaleList()
        else LocaleListCompat.forLanguageTags(languageTag)
      appContext.activityProvider?.currentActivity?.runOnUiThread {
        AppCompatDelegate.setApplicationLocales(locales)
      }
    }
  }
}
