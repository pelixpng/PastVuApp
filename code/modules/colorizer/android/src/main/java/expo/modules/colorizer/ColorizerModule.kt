package expo.modules.colorizer

import android.net.Uri
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.File

/** Colourises black-and-white photos on device with ONNX Runtime; the iOS twin uses Core ML. */
class ColorizerModule : Module() {
  private val context
    get() = requireNotNull(appContext.reactContext) { "No React context" }

  override fun definition() = ModuleDefinition {
    Name("Colorizer")

    // Async functions run off the main thread, which the model and the pixel work need.
    AsyncFunction("colorize") { path: String ->
      val store = ModelStore(context)
      if (!store.isInstalled) throw ModelUnavailableException()
      PhotoColorizer.colorize(file(path), store.modelFile, context.cacheDir).toUri().toString()
    }

    // The model is downloaded on first use; see ModelStore.
    Function("isModelInstalled") { ModelStore(context).isInstalled }

    AsyncFunction("installModel") { path: String, sha256: String ->
      ModelStore(context).install(file(path), sha256)
    }

    AsyncFunction("removeModel") { ModelStore(context).remove() }

    AsyncFunction("isMonochrome") { path: String ->
      MonochromeCheck.isMonochrome(file(path)) ?: throw UnreadablePhotoException(path)
    }
  }

  /** Accepts both a plain path and a file:// URI, as expo-file-system hands out the latter. */
  private fun file(path: String): File =
    if (path.startsWith("file:")) File(requireNotNull(Uri.parse(path).path)) else File(path)
}

class ModelUnavailableException :
  CodedException("The colorization model is not downloaded yet or failed to load")

class CorruptDownloadException :
  CodedException("The downloaded model is damaged or incomplete")

class UnreadablePhotoException(path: String) : CodedException("Could not read the photo at $path")

class ColorizationFailedException(reason: String) : CodedException("Colorizing failed: $reason")

private fun File.toUri(): Uri = Uri.fromFile(this)
