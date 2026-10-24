package expo.modules.colorizer

import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.ColorSpace
import android.graphics.ImageDecoder
import android.graphics.Paint
import android.graphics.Rect
import android.graphics.RectF
import android.graphics.Typeface
import java.io.File
import java.io.IOException
import kotlin.math.max
import kotlin.math.min
import kotlin.math.roundToInt

/**
 * The "AI COLORIZATION" mark on colourised photos, asked for by the PastVu community: a colourisation is the
 * model's guess, and a copy passed on without the app around it should still say so. The same
 * look and numbers as the iOS module (modules/colorizer/ios/Watermark.swift).
 */
object Watermark {
  private const val LABEL = "AI COLORIZATION"

  /**
   * Copies the photo with the mark in its bottom right corner, above PastVu's caption bar, to
   * `<name>-ai.jpg` in `outputDirectory`, replacing an earlier copy. The source stays as it is.
   */
  fun add(photo: File, outputDirectory: File): File {
    val bitmap = decode(photo) ?: throw UnreadablePhotoException(photo.path)
    try {
      val width = bitmap.width
      val height = bitmap.height
      // The colouriser leaves the caption bar grey, so its own check finds the bar on the result.
      // The pixel copy is dropped before encoding, as the heap is small.
      val caption = run {
        val pixels = IntArray(width * height)
        bitmap.getPixels(pixels, 0, width, 0, 0, width, height)
        // Grey, as colorize saw the original: JPEG bleeds the photo's colour into the bar's top
        // rows, which the tint test would stop at.
        for (i in pixels.indices) {
          val p = pixels[i]
          val grey = (((p shr 16) and 0xFF) + ((p shr 8) and 0xFF) + (p and 0xFF)) / 3
          pixels[i] = (0xFF shl 24) or (grey shl 16) or (grey shl 8) or grey
        }
        PhotoColorizer.captionRows(pixels, width, height)
      }
      drawMark(Canvas(bitmap), width, height - caption, min(width, height))
      val file = File(outputDirectory, "${photo.nameWithoutExtension}-ai.jpg")
      try {
        val written = file.outputStream().use { bitmap.compress(Bitmap.CompressFormat.JPEG, 92, it) }
        if (!written) throw IOException("JPEG encoding failed")
      } catch (_: IOException) {
        file.delete()
        throw UnwritablePhotoException(file.path)
      }
      return file
    } finally {
      bitmap.recycle()
    }
  }

  /**
   * The photo upright (EXIF orientation applied) at full size, drawable, in sRGB as colorize writes
   * it, so its colours pass through unchanged.
   */
  private fun decode(file: File): Bitmap? = try {
    ImageDecoder.decodeBitmap(ImageDecoder.createSource(file)) { decoder, _, _ ->
      decoder.allocator = ImageDecoder.ALLOCATOR_SOFTWARE
      decoder.isMutableRequired = true
      decoder.setTargetColorSpace(ColorSpace.get(ColorSpace.Named.SRGB))
    }
  } catch (_: Exception) {
    null
  }

  /**
   * A rounded pill with the label in white, sized by the photo's shorter side so it reads alike on
   * every photo, its bottom a margin above `bottom`: the caption bar's top, or the photo's edge.
   */
  private fun drawMark(canvas: Canvas, width: Int, bottom: Int, side: Int) {
    val height = max((0.07 * side).roundToInt(), 22).toFloat()
    val margin = max((0.03 * side).roundToInt(), 8).toFloat()
    val text = Paint(Paint.ANTI_ALIAS_FLAG).apply {
      color = Color.WHITE
      typeface = Typeface.DEFAULT_BOLD
      textSize = 0.62f * height
    }
    val textWidth = text.measureText(LABEL)
    val pillWidth = max(textWidth + 2 * 0.45f * height, height)
    val right = width - margin
    val pillBottom = bottom - margin
    val pill = RectF(right - pillWidth, pillBottom - height, right, pillBottom)
    val fill = Paint(Paint.ANTI_ALIAS_FLAG).apply { color = Color.argb(128, 0, 0, 0) }
    canvas.drawRoundRect(pill, height / 2, height / 2, fill)
    // Centred on the capitals' own bounds rather than the line, which leaves room for descenders.
    val capitals = Rect()
    text.getTextBounds(LABEL, 0, LABEL.length, capitals)
    canvas.drawText(LABEL, pill.centerX() - textWidth / 2, pill.centerY() - capitals.exactCenterY(), text)
  }
}
