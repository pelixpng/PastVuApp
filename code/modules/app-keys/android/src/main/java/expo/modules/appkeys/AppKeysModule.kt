package expo.modules.appkeys

import android.content.pm.PackageManager
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.security.MessageDigest

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

    // What a Google key restricted to this app checks: requests made outside Google's own SDKs
    // have to name the app in the X-Android-Package and X-Android-Cert headers themselves. The
    // certificate is read from the installed app rather than written down, because the Play
    // build, a local release build and a debug build are each signed by a different one.
    Function("identity") {
      val context = appContext.reactContext ?: return@Function mapOf<String, String>()
      mapOf("packageName" to context.packageName, "certSha1" to signingCertSha1(context.packageName))
    }
  }

  /** The SHA-1 of the certificate the installed app is signed with, as uppercase hex. */
  private fun signingCertSha1(packageName: String): String =
    try {
      val packageManager = appContext.reactContext?.packageManager ?: return ""
      // API 28, the app's minimum, has signingInfo; the signers of the APK's contents are the
      // current certificate, also after a key rotation.
      val signers = packageManager
        .getPackageInfo(packageName, PackageManager.GET_SIGNING_CERTIFICATES)
        .signingInfo
        ?.apkContentsSigners
      val certificate = signers?.firstOrNull() ?: return ""
      MessageDigest.getInstance("SHA-1")
        .digest(certificate.toByteArray())
        .joinToString("") { "%02X".format(it) }
    } catch (e: Exception) {
      ""
    }
}
