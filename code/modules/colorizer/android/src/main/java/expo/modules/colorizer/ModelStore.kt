package expo.modules.colorizer

import android.content.Context
import java.io.File
import java.security.MessageDigest

/**
 * Where the colorization model lives once downloaded. Android takes the ONNX file as it is (no
 * archive and no compiling, unlike Core ML): its SHA-256 is checked and it is moved into place.
 *
 * App-specific external storage: no permission needed, removed with the app, and big files are
 * what it is for. Falls back to internal storage where there is no external one.
 */
class ModelStore(context: Context) {
  private val directory: File =
    context.getExternalFilesDir("Colorizer") ?: File(context.noBackupFilesDir, "Colorizer")

  val modelFile = File(directory, "colorizer.onnx")

  /** The model is moved in only once complete, so being there means it is whole. */
  val isInstalled: Boolean
    get() = modelFile.isFile

  /** Takes the downloaded file, deleting it either way. */
  fun install(download: File, expectedSha256: String) {
    try {
      if (sha256(download) != expectedSha256.lowercase()) throw CorruptDownloadException()
      directory.mkdirs()
      val partial = File(directory, "colorizer.onnx.partial")
      partial.delete()
      // A rename where both sit on one volume; otherwise a copy.
      if (!download.renameTo(partial)) download.copyTo(partial, overwrite = true)
      if (!partial.renameTo(modelFile)) throw CorruptDownloadException()
    } finally {
      download.delete()
    }
  }

  /** Frees the space; the next palette press offers the download again. */
  fun remove() {
    directory.deleteRecursively()
  }

  private fun sha256(file: File): String {
    val digest = MessageDigest.getInstance("SHA-256")
    file.inputStream().use { input ->
      val buffer = ByteArray(1 shl 20)
      while (true) {
        val read = input.read(buffer)
        if (read < 0) break
        digest.update(buffer, 0, read)
      }
    }
    return digest.digest().joinToString("") { "%02x".format(it) }
  }
}
