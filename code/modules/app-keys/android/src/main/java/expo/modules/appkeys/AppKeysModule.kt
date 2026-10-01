package expo.modules.appkeys

import android.content.pm.PackageManager
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/**
 * Hands API keys to JavaScript from the manifest's `<meta-data>` entries.
 *
 * The values get there as manifest placeholders filled from the project's `.env` at build time
 * (see `plugins/withApiKeys.js`), the same way the Google Maps key is wired. Keeping them out of
 * the Expo config means they are not part of the `app.config` asset every bundle inspector shows.
 */
class AppKeysModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("AppKeys")

    Function("get") { name: String ->
      val context = appContext.reactContext ?: return@Function ""
      val info = context.packageManager.getApplicationInfo(context.packageName, PackageManager.GET_META_DATA)
      info.metaData?.getString(name) ?: ""
    }
  }
}
