package expo.modules.screencapture

import android.graphics.Bitmap
import android.graphics.Rect
import android.os.Handler
import android.os.Looper
import android.view.PixelCopy
import android.view.View
import expo.modules.kotlin.Promise
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.File
import java.io.FileOutputStream

/**
 * Snapshots a view as the user sees it, including WebView content drawn on the GPU.
 *
 * `react-native-view-shot` draws the view tree into a software canvas, and a hardware-accelerated
 * WebView contributes nothing to that: a Street View panorama comes out as a black box. `PixelCopy`
 * instead reads the composed window back from the display surface, so whatever is on screen inside
 * the view's bounds is what ends up in the file.
 */
class ScreenCaptureModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ScreenCapture")

    AsyncFunction("captureView") { viewTag: Int, promise: Promise ->
      val activity = appContext.currentActivity ?: throw Exceptions.MissingActivity()
      val view = appContext.findView<View>(viewTag)
        ?: throw CodedException("ERR_VIEW_NOT_FOUND", "No view with tag $viewTag", null)
      val cacheDir = appContext.cacheDirectory

      activity.runOnUiThread {
        if (view.width == 0 || view.height == 0) {
          promise.reject(CodedException("ERR_EMPTY_VIEW", "View has no size yet", null))
          return@runOnUiThread
        }
        val origin = IntArray(2).also { view.getLocationInWindow(it) }
        val bounds = Rect(origin[0], origin[1], origin[0] + view.width, origin[1] + view.height)
        val bitmap = Bitmap.createBitmap(view.width, view.height, Bitmap.Config.ARGB_8888)
        PixelCopy.request(activity.window, bounds, bitmap, { result ->
          if (result != PixelCopy.SUCCESS) {
            promise.reject(CodedException("ERR_PIXEL_COPY", "PixelCopy failed with code $result", null))
            return@request
          }
          try {
            val file = File.createTempFile("collage-", ".jpg", cacheDir)
            FileOutputStream(file).use { bitmap.compress(Bitmap.CompressFormat.JPEG, 92, it) }
            promise.resolve("file://${file.absolutePath}")
          } catch (e: Exception) {
            promise.reject(CodedException("ERR_WRITE", e.message, e))
          } finally {
            bitmap.recycle()
          }
        }, Handler(Looper.getMainLooper()))
      }
    }
  }
}
