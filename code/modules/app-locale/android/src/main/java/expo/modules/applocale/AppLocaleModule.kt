package expo.modules.applocale

import android.content.res.Resources
import android.os.Build
import android.view.textclassifier.TextClassificationManager
import android.view.textclassifier.TextClassifier
import android.view.textclassifier.TextLanguage
import androidx.annotation.RequiresApi
import androidx.appcompat.app.AppCompatDelegate
import androidx.core.os.LocaleListCompat
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel

/**
 * Below this the classifier is guessing, typically on very short or mixed-language text, and
 * offering a translation from a wrong language would be worse than offering none.
 */
private const val MIN_CONFIDENCE = 0.6f

class AppLocaleModule : Module() {
  /**
   * Where language detection runs. Expo's own queue for async functions is one thread shared by
   * every module: a colorization queued ahead would hold the translate buttons back for as long as
   * it runs, and a batch of classifier calls would in turn hold up everything queued behind it.
   */
  private val detectionScope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

  override fun definition() = ModuleDefinition {
    Name("AppLocale")

    OnDestroy {
      detectionScope.cancel()
    }

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

    // Off the main thread, which the text classifier needs: its calls block while the system loads
    // and runs the model. Language detection arrived in Android 10; older releases answer null for
    // every text, which callers read as "language unknown". The app's language goes unused here:
    // the classifier takes no hint, and it knows every language the app runs in, so it needs none.
    AsyncFunction("detectLanguages") { texts: List<String>, _: String ->
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) detectLanguages(texts)
      else texts.map { null }
    }.runOnQueue(detectionScope)
  }

  @RequiresApi(Build.VERSION_CODES.Q)
  private fun detectLanguages(texts: List<String>): List<String?> {
    val classifier = appContext.reactContext
      ?.getSystemService(TextClassificationManager::class.java)
      ?.textClassifier
      ?: return texts.map { null }
    return texts.map { text -> if (text.isBlank()) null else detectLanguage(classifier, text) }
  }

  /**
   * The base language of the top hypothesis, so "zh-Hans" becomes "zh" as on iOS. A failure on one
   * text, such as the system classifier service going away, costs only that text its answer.
   */
  @RequiresApi(Build.VERSION_CODES.Q)
  private fun detectLanguage(classifier: TextClassifier, text: String): String? =
    try {
      val result = classifier.detectLanguage(TextLanguage.Request.Builder(text).build())
      if (result.localeHypothesisCount == 0) {
        null
      } else {
        val locale = result.getLocale(0)
        if (result.getConfidenceScore(locale) < MIN_CONFIDENCE) null
        else locale.language.takeIf { it.isNotEmpty() && it != "und" }
      }
    } catch (e: Exception) {
      null
    }
}
