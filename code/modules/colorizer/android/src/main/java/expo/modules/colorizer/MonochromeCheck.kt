package expo.modules.colorizer

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import java.io.File
import kotlin.math.abs
import kotlin.math.cbrt
import kotlin.math.max
import kotlin.math.pow

/**
 * Tells black-and-white photos from colour ones, so the palette button shows only where colouring
 * makes sense: the colour of each pixel is predicted from its lightness alone (sepia and toning
 * follow the lightness), and a photo counts as colour when enough pixels stray far from that.
 * The same steps and thresholds as the iOS module (modules/colorizer/ios/MonochromeCheck.swift).
 */
object MonochromeCheck {
  private const val SIDE = 64
  private const val CROP = 0.06
  private const val DISTANCE = 10.0
  private const val THRESHOLD = 0.06

  fun isMonochrome(file: File): Boolean? {
    val pixels = pixels(file) ?: return null
    val count = SIDE * SIDE
    val l = DoubleArray(count)
    val a = DoubleArray(count)
    val b = DoubleArray(count)
    for (i in 0 until count) {
      val lab = lab(pixels[i])
      l[i] = lab[0]; a[i] = lab[1]; b[i] = lab[2]
    }
    val tintA = fit(a, l) ?: return true
    val tintB = fit(b, l) ?: return true
    var coloured = 0
    for (i in 0 until count) {
      val x = l[i]
      val da = a[i] - (tintA[0] + tintA[1] * x + tintA[2] * x * x)
      val db = b[i] - (tintB[0] + tintB[1] * x + tintB[2] * x * x)
      if (da * da + db * db > DISTANCE * DISTANCE) coloured++
    }
    return coloured.toDouble() / count <= THRESHOLD
  }

  /** The middle of the photo, without its border, at side × side. */
  private fun pixels(file: File): IntArray? {
    val full = BitmapFactory.decodeFile(file.path) ?: return null
    val x = (full.width * CROP).toInt()
    val y = (full.height * CROP).toInt()
    val middle = Bitmap.createBitmap(full, x, y, max(1, full.width - 2 * x), max(1, full.height - 2 * y))
    val small = Bitmap.createScaledBitmap(middle, SIDE, SIDE, true)
    val pixels = IntArray(SIDE * SIDE)
    small.getPixels(pixels, 0, SIDE, 0, 0, SIDE, SIDE)
    listOf(full, middle, small).distinct().forEach { it.recycle() }
    return pixels
  }

  /** The tint as a quadratic in lightness, by least squares: y ≈ c0 + c1·L + c2·L². */
  private fun fit(y: DoubleArray, l: DoubleArray): DoubleArray? {
    val s = DoubleArray(5)
    val t = DoubleArray(3)
    for (i in y.indices) {
      var p = 1.0
      for (k in 0 until 5) {
        s[k] += p
        if (k < 3) t[k] += y[i] * p
        p *= l[i]
      }
    }
    val m = arrayOf(
      doubleArrayOf(s[0], s[1], s[2]),
      doubleArrayOf(s[1], s[2], s[3]),
      doubleArrayOf(s[2], s[3], s[4]),
    )
    fun det(m: Array<DoubleArray>) =
      m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
        m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
        m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0])
    val d = det(m)
    // A flat photo (one lightness throughout) has no curve to fit; it has no colour either.
    if (abs(d) <= 1e-9 * max(1.0, abs(s[4] * s[2] * s[0]))) return null
    fun replaced(column: Int) = Array(3) { row -> DoubleArray(3) { c -> if (c == column) t[row] else m[row][c] } }
    return doubleArrayOf(det(replaced(0)) / d, det(replaced(1)) / d, det(replaced(2)) / d)
  }

  /** CIE Lab of an sRGB pixel, D65 white. */
  private fun lab(p: Int): DoubleArray {
    fun linear(v: Int): Double {
      val c = v / 255.0
      return if (c <= 0.04045) c / 12.92 else ((c + 0.055) / 1.055).pow(2.4)
    }
    fun f(t: Double) = if (t > 216.0 / 24389) cbrt(t) else t / (3 * (6.0 / 29) * (6.0 / 29)) + 4.0 / 29
    val lr = linear((p shr 16) and 0xFF)
    val lg = linear((p shr 8) and 0xFF)
    val lb = linear(p and 0xFF)
    val x = (0.4124564 * lr + 0.3575761 * lg + 0.1804375 * lb) / 0.95047
    val y = 0.2126729 * lr + 0.7151522 * lg + 0.0721750 * lb
    val z = (0.0193339 * lr + 0.1191920 * lg + 0.9503041 * lb) / 1.08883
    val fx = f(x)
    val fy = f(y)
    val fz = f(z)
    return doubleArrayOf(116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz))
  }
}
