package expo.modules.colorizer

import ai.onnxruntime.OnnxTensor
import ai.onnxruntime.OrtEnvironment
import ai.onnxruntime.OrtSession
import android.graphics.Bitmap
import android.graphics.ColorSpace
import android.graphics.ImageDecoder
import java.io.File
import java.nio.FloatBuffer
import java.util.UUID
import kotlin.math.abs
import kotlin.math.cbrt
import kotlin.math.max
import kotlin.math.min
import kotlin.math.pow
import kotlin.math.roundToInt

/**
 * DDColor-L (Kang et al., ICCV 2023; Apache-2.0): the photo's lightness goes in as a neutral grey at
 * 512×512, its colour (a, b of CIE Lab) comes out at the same size, and is then stretched over the
 * lightness of the original at full size. The same steps and numbers as the iOS module
 * (modules/colorizer/ios/ColorizerModule.swift), so both platforms colour a photo alike.
 */
object PhotoColorizer {
  /** The model's input and output side, the size DDColor was trained at. */
  private const val SIDE = 512
  /** The longest side a photo is decoded at, as on iOS. */
  private const val MAX_SIDE = 2048
  /** Where the Java heap (256 MB on many phones) runs short at full size: a second try, smaller. */
  private const val FALLBACK_SIDE = 1280

  // One colorization at a time: each loads the model, and two copies would double the memory.
  private val lock = Any()

  fun colorize(photo: File, model: File, outputDirectory: File): File = synchronized(lock) {
    try {
      colorize(photo, model, outputDirectory, MAX_SIDE)
    } catch (_: OutOfMemoryError) {
      System.gc()
      colorize(photo, model, outputDirectory, FALLBACK_SIDE)
    }
  }

  private fun colorize(photo: File, model: File, outputDirectory: File, maxSide: Int): File {
    val bitmap = decode(photo, maxSide) ?: throw UnreadablePhotoException(photo.path)
    val width = bitmap.width
    val height = bitmap.height
    val (a, b) = predictColour(bitmap, model)
    val pixels = IntArray(width * height)
    bitmap.getPixels(pixels, 0, width, 0, 0, width, height)
    bitmap.recycle()
    removeCast(a, b)

    // Lightness of the original at full size (over 100): the result's detail, and the guide for
    // its colour. Kept once; the filter's arrays are reused, as the heap is small.
    val n = width * height
    val guide = FloatArray(n) { lightness(pixels[it]) / 100 }
    val radius = max(4, width / 150)
    val scratch = FloatArray(n)
    val guideMean = FloatArray(n)
    boxFilter(guide, guideMean, scratch, width, height, radius)
    val work = FloatArray(n) { guide[it] * guide[it] }
    val guideVariance = FloatArray(n)
    boxFilter(work, guideVariance, scratch, width, height, radius)
    for (i in 0 until n) guideVariance[i] -= guideMean[i] * guideMean[i]

    val filter = GuidedFilter(guide, guideMean, guideVariance, work, scratch, width, height, radius)
    val fullA = filter.apply(upsample(a, width, height))
    val fullB = filter.apply(upsample(b, width, height))

    // PastVu's caption bar under the photo stays grey instead of taking the colour around it.
    val caption = captionRows(pixels, width, height)
    for (i in (height - caption) * width until n) {
      fullA[i] = 0f
      fullB[i] = 0f
    }

    for (i in 0 until n) pixels[i] = toPixel(guide[i] * 100, fullA[i], fullB[i])
    val result = Bitmap.createBitmap(pixels, width, height, Bitmap.Config.ARGB_8888)
    val file = File(outputDirectory, "colorized-${UUID.randomUUID()}.jpg")
    try {
      file.outputStream().use { result.compress(Bitmap.CompressFormat.JPEG, 92, it) }
    } finally {
      result.recycle()
    }
    return file
  }

  /**
   * Every core, up to 8. ONNX Runtime hands work out in small pieces to whichever thread is free,
   * so on phones with fast and slow cores the fast ones take more and the slow ones still add to
   * it: faster than a thread per fast core alone. Past 8, threads mostly wait on one another.
   *
   * Counted from the kernel's list of possible cores: the runtime count leaves out cores that are
   * switched off at that moment to save power, which phones do while idle.
   */
  private val threads: Int by lazy {
    val possible = try {
      File("/sys/devices/system/cpu/possible").readText().trim().split(",").sumOf { range ->
        val bounds = range.split("-").map { it.trim().toInt() }
        if (bounds.size == 2) bounds[1] - bounds[0] + 1 else 1
      }
    } catch (_: Exception) {
      0
    }
    max(possible, Runtime.getRuntime().availableProcessors()).coerceIn(1, 8)
  }

  /** The photo in sRGB with its EXIF orientation applied, no larger than `maxSide`. */
  private fun decode(file: File, maxSide: Int): Bitmap? = try {
    ImageDecoder.decodeBitmap(ImageDecoder.createSource(file)) { decoder, info, _ ->
      decoder.allocator = ImageDecoder.ALLOCATOR_SOFTWARE
      decoder.setTargetColorSpace(ColorSpace.get(ColorSpace.Named.SRGB))
      val longest = max(info.size.width, info.size.height)
      if (longest > maxSide) {
        val scale = maxSide.toFloat() / longest
        decoder.setTargetSize(
          max(1, (info.size.width * scale).roundToInt()),
          max(1, (info.size.height * scale).roundToInt()),
        )
      }
    }
  } catch (_: Exception) {
    null
  }

  // ---------------------------------------------------------------------------- Colour

  /**
   * The model's a and b planes at 512×512. The model is loaded for this call alone and closed
   * before the full-size work starts, so the two never hold memory at the same time.
   */
  private fun predictColour(bitmap: Bitmap, model: File): Pair<FloatArray, FloatArray> {
    val small = Bitmap.createScaledBitmap(bitmap, SIDE, SIDE, true)
    val pixels = IntArray(SIDE * SIDE)
    small.getPixels(pixels, 0, SIDE, 0, 0, SIDE, SIDE)
    if (small !== bitmap) small.recycle()
    // All the model sees: the downscaled photo as a neutral grey of the same lightness, which is
    // how DDColor's own pipeline prepares it (Lab with a = b = 0, back to sRGB).
    val input = FloatBuffer.allocate(SIDE * SIDE)
    for (p in pixels) input.put(grey(p))
    input.rewind()

    val environment = OrtEnvironment.getEnvironment()
    val options = OrtSession.SessionOptions().apply {
      // The CPU only: the GPU and NPU paths compute in half precision, where DDColor-L overflows
      // and paints magenta casts and cyan blotches (seen on iPhone's Neural Engine).
      setIntraOpNumThreads(threads)
      // Idle threads sleep instead of spinning: barely slower, and it neither drains the battery
      // nor takes the cores the interface needs between the model's steps.
      addConfigEntry("session.intra_op.allow_spinning", "0")
      // Without the arena, memory goes back as soon as each step is done: about 200 MB less at
      // the peak, for a few percent of speed.
      setCPUArenaAllocator(false)
      setOptimizationLevel(OrtSession.SessionOptions.OptLevel.ALL_OPT)
    }
    try {
      environment.createSession(model.path, options).use { session ->
        OnnxTensor.createTensor(environment, input, longArrayOf(1, 1, SIDE.toLong(), SIDE.toLong())).use { tensor ->
          session.run(mapOf("grey" to tensor)).use { result ->
            val ab = (result.get("ab").orElse(null) as? OnnxTensor)?.floatBuffer
              ?: throw ColorizationFailedException("the model returned no colour")
            val plane = SIDE * SIDE
            val a = FloatArray(plane)
            val b = FloatArray(plane)
            ab.get(a)
            ab.get(b)
            return a to b
          }
        }
      }
    } catch (error: ColorizationFailedException) {
      throw error
    } catch (error: Exception) {
      throw ModelUnavailableException()
    } finally {
      options.close()
    }
  }

  /**
   * DDColor tints whole photos warm (pink-yellow on old prints). Taking most of the average tint
   * away leaves greys, whites and skies neutral while keeping the colours of things in the scene.
   */
  private fun removeCast(a: FloatArray, b: FloatArray) {
    val share = 0.8f
    val meanA = a.sum() / a.size
    val meanB = b.sum() / b.size
    for (i in a.indices) {
      a[i] -= share * meanA
      b[i] -= share * meanB
    }
  }

  private class Sample(val low: Int, val high: Int, val weight: Float)

  /** Where each of `count` output pixels falls on the prediction's samples, pixel centres aligned. */
  private fun samples(count: Int): Array<Sample> {
    val scale = SIDE.toFloat() / count
    return Array(count) { i ->
      val position = ((i + 0.5f) * scale - 0.5f).coerceIn(0f, (SIDE - 1).toFloat())
      val low = position.toInt()
      Sample(low, min(low + 1, SIDE - 1), position - low)
    }
  }

  /** A 512×512 plane stretched to the photo's size. */
  private fun upsample(plane: FloatArray, width: Int, height: Int): FloatArray {
    val columns = samples(width)
    val rows = samples(height)
    val out = FloatArray(width * height)
    for (y in 0 until height) {
      val row = rows[y]
      for (x in 0 until width) {
        val column = columns[x]
        val top = plane[row.low * SIDE + column.low] * (1 - column.weight) +
          plane[row.low * SIDE + column.high] * column.weight
        val bottom = plane[row.high * SIDE + column.low] * (1 - column.weight) +
          plane[row.high * SIDE + column.high] * column.weight
        out[y * width + x] = top * (1 - row.weight) + bottom * row.weight
      }
    }
    return out
  }

  /**
   * Guided filter (He et al.) with the photo's lightness as the guide: the colour, predicted at
   * 512×512 and stretched, follows the edges of things instead of smearing over them. Works in
   * place on the given arrays, as several full-size copies would not fit the heap.
   */
  private class GuidedFilter(
    val guide: FloatArray,
    val guideMean: FloatArray,
    val guideVariance: FloatArray,
    val work: FloatArray,
    val scratch: FloatArray,
    val width: Int,
    val height: Int,
    val radius: Int,
  ) {
    /** Filters `source` and returns it, overwritten with the result. */
    fun apply(source: FloatArray): FloatArray {
      val epsilon = 1e-3f
      val n = source.size
      val mean = FloatArray(n)
      boxFilter(source, mean, scratch, width, height, radius)
      for (i in 0 until n) work[i] = guide[i] * source[i]
      val slope = FloatArray(n)
      boxFilter(work, slope, scratch, width, height, radius)
      for (i in 0 until n) {
        slope[i] = (slope[i] - guideMean[i] * mean[i]) / (guideVariance[i] + epsilon)
        mean[i] -= slope[i] * guideMean[i] // now the offset
      }
      boxFilter(slope, work, scratch, width, height, radius) // the slope's mean
      boxFilter(mean, slope, scratch, width, height, radius) // the offset's mean
      for (i in 0 until n) source[i] = work[i] * guide[i] + slope[i]
      return source
    }
  }

  /**
   * Mean over a square window, clipped at the edges, into `out`. Separable running sums kept in
   * Double: a Float integral image loses precision over a few million pixels.
   */
  private fun boxFilter(x: FloatArray, out: FloatArray, horizontal: FloatArray, width: Int, height: Int, radius: Int) {
    for (y in 0 until height) {
      val row = y * width
      var sum = 0.0
      var count = 0
      for (i in 0..min(radius, width - 1)) {
        sum += x[row + i]
        count++
      }
      for (i in 0 until width) {
        horizontal[row + i] = (sum / count).toFloat()
        val add = i + radius + 1
        val drop = i - radius
        if (add < width) { sum += x[row + add]; count++ }
        if (drop >= 0) { sum -= x[row + drop]; count-- }
      }
    }
    for (column in 0 until width) {
      var sum = 0.0
      var count = 0
      for (j in 0..min(radius, height - 1)) {
        sum += horizontal[j * width + column]
        count++
      }
      for (j in 0 until height) {
        out[j * width + column] = (sum / count).toFloat()
        val add = j + radius + 1
        val drop = j - radius
        if (add < height) { sum += horizontal[add * width + column]; count++ }
        if (drop >= 0) { sum -= horizontal[drop * width + column]; count-- }
      }
    }
  }

  /**
   * Rows of PastVu's caption bar at the bottom: one flat grey across most of the row, the
   * caption's text aside, with no colour in it. At most a tenth of the photo. Watermark runs it on
   * the coloured result, where the bar stays grey, to put the AI mark above the bar.
   */
  internal fun captionRows(pixels: IntArray, width: Int, height: Int): Int {
    fun grey(p: Int) = (red(p) + green(p) + blue(p)) / 3
    val histogram = IntArray(256)
    for (x in 0 until width) histogram[grey(pixels[(height - 1) * width + x])]++
    val background = histogram.indices.maxByOrNull { histogram[it] } ?: return 0
    var rows = 0
    var y = height - 1
    while (y > height - height / 10) {
      var flat = 0
      var tint = 0
      for (x in 0 until width) {
        val p = pixels[y * width + x]
        if (abs(grey(p) - background) <= 3) flat++
        tint += maxOf(red(p), green(p), blue(p)) - minOf(red(p), green(p), blue(p))
      }
      if (flat * 10 <= width * 6 || tint >= width * 4) break
      rows++
      y--
    }
    return rows
  }

  // --------------------------------------- CIE Lab, sRGB with a D65 white (as in the Swift module)

  private fun red(p: Int) = (p shr 16) and 0xFF
  private fun green(p: Int) = (p shr 8) and 0xFF
  private fun blue(p: Int) = p and 0xFF

  /** sRGB byte to linear light. */
  private val toLinear = FloatArray(256) { i ->
    val v = i / 255f
    if (v <= 0.04045f) v / 12.92f else ((v + 0.055f) / 1.055f).pow(2.4f)
  }

  /** Linear light to sRGB byte, sampled finely enough that the steps do not show. */
  private const val GAMMA_STEPS = 4096
  private val toSrgb = IntArray(GAMMA_STEPS + 1) { i ->
    val v = i.toFloat() / GAMMA_STEPS
    val s = if (v <= 0.0031308f) v * 12.92f else 1.055f * v.pow(1 / 2.4f) - 0.055f
    (s * 255 + 0.5f).toInt().coerceIn(0, 255)
  }

  private const val EPSILON = 216f / 24389 // (6/29)³
  private const val KAPPA_SLOPE = 3 * (6f / 29) * (6f / 29)
  private const val OFFSET = 4f / 29

  /** Relative luminance, Y of CIE XYZ. */
  private fun luminance(p: Int) =
    0.2126729f * toLinear[red(p)] + 0.7151522f * toLinear[green(p)] + 0.0721750f * toLinear[blue(p)]

  private fun lightness(p: Int): Float {
    val y = luminance(p)
    val f = if (y > EPSILON) cbrt(y) else y / KAPPA_SLOPE + OFFSET
    return 116 * f - 16
  }

  /**
   * The neutral sRGB grey (0...1) with the pixel's lightness: a Lab colour with a = b = 0 has the
   * same luminance on all three channels, so this is just that luminance gamma-encoded.
   */
  private fun grey(p: Int): Float {
    val y = luminance(p)
    return if (y <= 0.0031308f) y * 12.92f else 1.055f * y.pow(1 / 2.4f) - 0.055f
  }

  private fun toPixel(l: Float, a: Float, b: Float): Int {
    val fy = (l + 16) / 116
    val fx = fy + a / 500
    val fz = fy - b / 200
    fun inverse(t: Float) = if (t > 6f / 29) t * t * t else KAPPA_SLOPE * (t - OFFSET)
    val x = 0.95047f * inverse(fx)
    val yy = inverse(fy)
    val z = 1.08883f * inverse(fz)
    val r = 3.2404542f * x - 1.5371385f * yy - 0.4985314f * z
    val g = -0.9692660f * x + 1.8760108f * yy + 0.0415560f * z
    val bl = 0.0556434f * x - 0.2040259f * yy + 1.0572252f * z
    return (0xFF shl 24) or (encode(r) shl 16) or (encode(g) shl 8) or encode(bl)
  }

  private fun encode(linear: Float): Int =
    toSrgb[(linear.coerceIn(0f, 1f) * GAMMA_STEPS + 0.5f).toInt()]
}
