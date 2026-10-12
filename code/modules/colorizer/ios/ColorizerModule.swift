import CoreML
import ExpoModulesCore
import ImageIO
import UIKit

/// Colourises black-and-white photos on device with Core ML.
public class ColorizerModule: Module {
  public func definition() -> ModuleDefinition {
    Name("Colorizer")

    // Expo runs async functions off the main thread, which the model and the pixel work need.
    AsyncFunction("colorize") { (path: String) throws -> String in
      guard #available(iOS 16.0, *) else { throw UnsupportedSystemException() }
      return try PhotoColorizer.shared.colorize(fileAt: ColorizerModule.fileURL(path)).absoluteString
    }

    // The model is downloaded on first use; see ModelStore.
    Function("isModelInstalled") { () -> Bool in
      guard #available(iOS 16.0, *) else { return false }
      return ModelStore.isInstalled
    }

    AsyncFunction("installModel") { (zipPath: String, sha256: String) async throws in
      guard #available(iOS 16.0, *) else { throw UnsupportedSystemException() }
      try await ModelStore.install(zip: ColorizerModule.fileURL(zipPath), sha256: sha256)
    }

    AsyncFunction("removeModel") { () throws in
      guard #available(iOS 16.0, *) else { return }
      try ModelStore.remove()
    }

    AsyncFunction("isMonochrome") { (path: String) throws -> Bool in
      guard let monochrome = MonochromeCheck.isMonochrome(fileAt: ColorizerModule.fileURL(path)) else {
        throw UnreadablePhotoException(path)
      }
      return monochrome
    }
  }

  /// Accepts both a plain path and a file:// URI, as expo-file-system hands out the latter.
  static func fileURL(_ path: String) -> URL {
    if let url = URL(string: path), url.isFileURL {
      return url
    }
    return URL(fileURLWithPath: path)
  }
}

final class UnsupportedSystemException: Exception {
  override var reason: String { "Colorizing needs iOS 16 or later" }
}

final class ModelUnavailableException: Exception {
  override var reason: String { "The colorization model is not downloaded yet or failed to load" }
}

final class CorruptDownloadException: Exception {
  override var reason: String { "The downloaded model is damaged or incomplete" }
}

final class UnreadablePhotoException: GenericException<String> {
  override var reason: String { "Could not read the photo at \(param)" }
}

final class ColorizationFailedException: GenericException<String> {
  override var reason: String { "Colorizing failed: \(param)" }
}

/// DDColor-L (Kang et al., ICCV 2023; Apache-2.0): the photo's lightness goes in as a neutral grey at
/// 512×512, its colour (a, b of CIE Lab) comes out at the same size. The colour is then stretched
/// over the lightness of the original at full size, which is where the result's detail comes from.
@available(iOS 16.0, *)
final class PhotoColorizer {
  static let shared = PhotoColorizer()

  /// The model's input and output side, the size DDColor was trained at.
  private let side = 512
  /// The longest side a photo is decoded at: more than a phone screen needs, and it bounds memory.
  private let maxPixelSize = 2048

  // One colorization at a time: each loads the model, and two copies would double the memory.
  private let lock = NSLock()

  func colorize(fileAt url: URL) throws -> URL {
    lock.lock()
    defer { lock.unlock() }
    guard let image = decode(url) else { throw UnreadablePhotoException(url.path) }
    let width = image.width
    let height = image.height
    let original = try pixels(of: image, width: width, height: height)

    var (a, b) = try predictColour(of: image)
    removeCast(&a, &b)

    // Lightness of the original at full size: the result's detail, and the guide for its colour.
    var lightness = [Float](repeating: 0, count: width * height)
    for i in 0..<width * height {
      let p = i * 4
      lightness[i] = Self.lightness(original[p], original[p + 1], original[p + 2])
    }
    let guide = lightness.map { $0 / 100 }
    let radius = max(4, width / 150)
    let guideMean = boxFilter(guide, width: width, height: height, radius: radius)
    let guideVariance = zip(boxFilter(guide.map { $0 * $0 }, width: width, height: height, radius: radius), guideMean)
      .map { $0 - $1 * $1 }
    var fullA = guidedFilter(
      upsample(a, width: width, height: height), guide: guide, guideMean: guideMean,
      guideVariance: guideVariance, width: width, height: height, radius: radius
    )
    var fullB = guidedFilter(
      upsample(b, width: width, height: height), guide: guide, guideMean: guideMean,
      guideVariance: guideVariance, width: width, height: height, radius: radius
    )

    // PastVu's caption bar under the photo stays grey instead of taking the colour around it.
    let caption = captionRows(original, width: width, height: height)
    for i in (height - caption) * width..<height * width {
      fullA[i] = 0
      fullB[i] = 0
    }

    var output = [UInt8](repeating: 255, count: width * height * 4)
    for i in 0..<width * height {
      Self.writeRGB(l: lightness[i], a: fullA[i], b: fullB[i], into: &output, at: i * 4)
    }
    return try writeJPEG(output, width: width, height: height)
  }


  // MARK: - Colour

  /// The model's a and b planes at 512×512. The model is loaded for this call alone and released
  /// before the full-size work starts, so the two never hold memory at the same time.
  private func predictColour(of image: CGImage) throws -> ([Float], [Float]) {
    try autoreleasepool {
      // The full model takes about half a gigabyte while loaded; keeping it between runs would hold
      // that for as long as the app lives.
      let model = try loadModel()
      let small = try pixels(of: image, width: side, height: side)
      // All the model sees: the downscaled photo as a neutral grey of the same lightness, which is
      // how DDColor's own pipeline prepares it (Lab with a = b = 0, back to sRGB).
      let input = try MLMultiArray(
        shape: [1, 1, NSNumber(value: side), NSNumber(value: side)],
        dataType: .float32
      )
      input.withUnsafeMutableBufferPointer(ofType: Float.self) { buffer, strides in
        for y in 0..<side {
          for x in 0..<side {
            let p = (y * side + x) * 4
            buffer[y * strides[2] + x * strides[3]] = Self.grey(small[p], small[p + 1], small[p + 2])
          }
        }
      }
      let features = try MLDictionaryFeatureProvider(dictionary: ["grey": MLFeatureValue(multiArray: input)])
      let prediction = try model.prediction(from: features)
      guard let ab = prediction.featureValue(for: "ab")?.multiArrayValue else {
        throw ColorizationFailedException("the model returned no colour")
      }
      return try channels(of: ab)
    }
  }

  /// DDColor tints whole photos warm (pink-yellow on old prints). Taking most of the average tint
  /// away leaves greys, whites and skies neutral while keeping the colours of things in the scene.
  private func removeCast(_ a: inout [Float], _ b: inout [Float]) {
    let share: Float = 0.8
    let meanA = a.reduce(0, +) / Float(a.count)
    let meanB = b.reduce(0, +) / Float(b.count)
    for i in a.indices {
      a[i] -= share * meanA
      b[i] -= share * meanB
    }
  }

  /// A 512×512 plane stretched to the photo's size, pixel centres aligned.
  private func upsample(_ plane: [Float], width: Int, height: Int) -> [Float] {
    let columns = samples(count: width)
    let rows = samples(count: height)
    var out = [Float](repeating: 0, count: width * height)
    for y in 0..<height {
      let row = rows[y]
      for x in 0..<width {
        let column = columns[x]
        let top = plane[row.low * side + column.low] * (1 - column.weight) + plane[row.low * side + column.high] * column.weight
        let bottom = plane[row.high * side + column.low] * (1 - column.weight) + plane[row.high * side + column.high] * column.weight
        out[y * width + x] = top * (1 - row.weight) + bottom * row.weight
      }
    }
    return out
  }

  /// Guided filter (He et al.) with the photo's lightness as the guide: the colour, predicted at
  /// 512×512 and stretched, follows the edges of things instead of smearing over them.
  private func guidedFilter(
    _ source: [Float], guide: [Float], guideMean: [Float], guideVariance: [Float],
    width: Int, height: Int, radius: Int
  ) -> [Float] {
    let epsilon: Float = 1e-3
    let sourceMean = boxFilter(source, width: width, height: height, radius: radius)
    let product = boxFilter(zip(guide, source).map { $0 * $1 }, width: width, height: height, radius: radius)
    var slope = [Float](repeating: 0, count: source.count)
    var offset = [Float](repeating: 0, count: source.count)
    for i in source.indices {
      slope[i] = (product[i] - guideMean[i] * sourceMean[i]) / (guideVariance[i] + epsilon)
      offset[i] = sourceMean[i] - slope[i] * guideMean[i]
    }
    let slopeMean = boxFilter(slope, width: width, height: height, radius: radius)
    let offsetMean = boxFilter(offset, width: width, height: height, radius: radius)
    var out = [Float](repeating: 0, count: source.count)
    for i in source.indices {
      out[i] = slopeMean[i] * guide[i] + offsetMean[i]
    }
    return out
  }

  /// Mean over a square window, clipped at the edges. Separable running sums kept in Double: a
  /// Float integral image loses precision over a few million pixels.
  private func boxFilter(_ x: [Float], width: Int, height: Int, radius: Int) -> [Float] {
    var horizontal = [Float](repeating: 0, count: x.count)
    for y in 0..<height {
      let row = y * width
      var sum = 0.0
      var count = 0
      for i in 0...min(radius, width - 1) {
        sum += Double(x[row + i])
        count += 1
      }
      for i in 0..<width {
        horizontal[row + i] = Float(sum / Double(count))
        let add = i + radius + 1
        let drop = i - radius
        if add < width { sum += Double(x[row + add]); count += 1 }
        if drop >= 0 { sum -= Double(x[row + drop]); count -= 1 }
      }
    }
    var out = [Float](repeating: 0, count: x.count)
    for column in 0..<width {
      var sum = 0.0
      var count = 0
      for j in 0...min(radius, height - 1) {
        sum += Double(horizontal[j * width + column])
        count += 1
      }
      for j in 0..<height {
        out[j * width + column] = Float(sum / Double(count))
        let add = j + radius + 1
        let drop = j - radius
        if add < height { sum += Double(horizontal[add * width + column]); count += 1 }
        if drop >= 0 { sum -= Double(horizontal[drop * width + column]); count -= 1 }
      }
    }
    return out
  }

  /// Rows of PastVu's caption bar at the bottom: one flat grey across most of the row, the caption's
  /// text aside, with no colour in it. At most a tenth of the photo.
  private func captionRows(_ rgba: [UInt8], width: Int, height: Int) -> Int {
    func grey(_ i: Int) -> Int { (Int(rgba[i * 4]) + Int(rgba[i * 4 + 1]) + Int(rgba[i * 4 + 2])) / 3 }
    var histogram = [Int](repeating: 0, count: 256)
    for x in 0..<width { histogram[grey((height - 1) * width + x)] += 1 }
    guard let background = histogram.indices.max(by: { histogram[$0] < histogram[$1] }) else { return 0 }
    var rows = 0
    for y in stride(from: height - 1, to: height - height / 10, by: -1) {
      var flat = 0
      var tint = 0
      for x in 0..<width {
        let i = y * width + x
        if abs(grey(i) - background) <= 3 { flat += 1 }
        let r = Int(rgba[i * 4]), g = Int(rgba[i * 4 + 1]), bl = Int(rgba[i * 4 + 2])
        tint += max(r, g, bl) - min(r, g, bl)
      }
      guard flat * 10 > width * 6, tint < width * 4 else { break }
      rows += 1
    }
    return rows
  }

  // MARK: - Model

  private func loadModel() throws -> MLModel {
    // Downloaded on first use, not shipped with the app (224 MB); see ModelStore.
    guard ModelStore.isInstalled else { throw ModelUnavailableException() }
    let url = ModelStore.modelURL
    let configuration = MLModelConfiguration()
    // CPU only: it computes in full precision. The Neural Engine and the GPU run the model in half
    // precision, where DDColor-L overflows and paints magenta casts and cyan blotches (on a Mac the
    // colours drift up to 220 off the PyTorch reference; on the CPU, 4 at most).
    configuration.computeUnits = .cpuOnly
    do {
      return try MLModel(contentsOf: url, configuration: configuration)
    } catch {
      throw ModelUnavailableException()
    }
  }

  /// The a and b planes of the prediction, whatever its strides. The model's output is Float32
  /// (see scripts/colorizer/convert_ddcolor.py); Float16 is left out, as the x86_64 simulator lacks it.
  private func channels(of array: MLMultiArray) throws -> ([Float], [Float]) {
    let strides = array.strides.map(\.intValue)
    var a = [Float](repeating: 0, count: side * side)
    var b = [Float](repeating: 0, count: side * side)
    func read<T>(_ type: T.Type, _ convert: (T) -> Float) where T: MLShapedArrayScalar {
      array.withUnsafeBufferPointer(ofType: type) { buffer in
        for y in 0..<side {
          for x in 0..<side {
            let offset = y * strides[2] + x * strides[3]
            a[y * side + x] = convert(buffer[offset])
            b[y * side + x] = convert(buffer[strides[1] + offset])
          }
        }
      }
    }
    switch array.dataType {
    case .float32: read(Float.self) { $0 }
    case .double: read(Double.self) { Float($0) }
    default: throw ColorizationFailedException("unexpected output type \(array.dataType.rawValue)")
    }
    return (a, b)
  }

  // MARK: - Pixels

  /// The photo with its EXIF orientation applied, no larger than `maxPixelSize`.
  private func decode(_ url: URL) -> CGImage? {
    guard let source = CGImageSourceCreateWithURL(url as CFURL, nil) else { return nil }
    let options: [CFString: Any] = [
      kCGImageSourceCreateThumbnailFromImageAlways: true,
      kCGImageSourceCreateThumbnailWithTransform: true,
      kCGImageSourceThumbnailMaxPixelSize: maxPixelSize,
      kCGImageSourceShouldCacheImmediately: true,
    ]
    return CGImageSourceCreateThumbnailAtIndex(source, 0, options as CFDictionary)
  }

  /// RGBA in sRGB at the given size; grayscale photos come out with R = G = B.
  private func pixels(of image: CGImage, width: Int, height: Int) throws -> [UInt8] {
    var data = [UInt8](repeating: 0, count: width * height * 4)
    let drawn = data.withUnsafeMutableBytes { bytes -> Bool in
      guard let space = CGColorSpace(name: CGColorSpace.sRGB),
            let context = CGContext(
              data: bytes.baseAddress,
              width: width,
              height: height,
              bitsPerComponent: 8,
              bytesPerRow: width * 4,
              space: space,
              bitmapInfo: CGImageAlphaInfo.noneSkipLast.rawValue
            )
      else { return false }
      context.interpolationQuality = .high
      context.draw(image, in: CGRect(x: 0, y: 0, width: width, height: height))
      return true
    }
    guard drawn else { throw ColorizationFailedException("could not draw the photo") }
    return data
  }

  private struct Sample {
    let low: Int
    let high: Int
    let weight: Float
  }

  /// Where each of `count` output pixels falls on the prediction's samples, pixel centres aligned.
  private func samples(count: Int) -> [Sample] {
    let scale = Float(side) / Float(count)
    return (0..<count).map { i in
      let position = min(max((Float(i) + 0.5) * scale - 0.5, 0), Float(side - 1))
      let low = Int(position)
      return Sample(low: low, high: min(low + 1, side - 1), weight: position - Float(low))
    }
  }

  private func writeJPEG(_ rgba: [UInt8], width: Int, height: Int) throws -> URL {
    guard let space = CGColorSpace(name: CGColorSpace.sRGB),
          let provider = CGDataProvider(data: Data(rgba) as CFData),
          let image = CGImage(
            width: width,
            height: height,
            bitsPerComponent: 8,
            bitsPerPixel: 32,
            bytesPerRow: width * 4,
            space: space,
            bitmapInfo: CGBitmapInfo(rawValue: CGImageAlphaInfo.noneSkipLast.rawValue),
            provider: provider,
            decode: nil,
            shouldInterpolate: false,
            intent: .defaultIntent
          ),
          let jpeg = UIImage(cgImage: image).jpegData(compressionQuality: 0.92)
    else { throw ColorizationFailedException("could not encode the result") }
    let caches = FileManager.default.urls(for: .cachesDirectory, in: .userDomainMask)[0]
    let url = caches.appendingPathComponent("colorized-\(UUID().uuidString).jpg")
    try jpeg.write(to: url)
    return url
  }

  // MARK: - CIE Lab, sRGB with a D65 white (the same maths as
  // scripts/colorizer/convert_ddcolor.py)

  /// sRGB byte to linear light.
  private static let toLinear: [Float] = (0..<256).map { i in
    let v = Float(i) / 255
    return v <= 0.04045 ? v / 12.92 : powf((v + 0.055) / 1.055, 2.4)
  }

  /// Linear light to sRGB byte, sampled finely enough that the steps do not show.
  private static let gammaSteps = 4096
  private static let toSRGB: [UInt8] = (0...gammaSteps).map { i in
    let v = Float(i) / Float(gammaSteps)
    let s = v <= 0.0031308 ? v * 12.92 : 1.055 * powf(v, 1 / 2.4) - 0.055
    return UInt8(min(max(s * 255 + 0.5, 0), 255))
  }

  private static let epsilon: Float = 216 / 24389 // (6/29)³
  private static let kappaSlope: Float = 3 * (6 / 29) * (6 / 29)
  private static let offset: Float = 4 / 29

  /// Relative luminance, Y of CIE XYZ.
  @inline(__always)
  static func luminance(_ r: UInt8, _ g: UInt8, _ b: UInt8) -> Float {
    0.2126729 * toLinear[Int(r)] + 0.7151522 * toLinear[Int(g)] + 0.0721750 * toLinear[Int(b)]
  }

  @inline(__always)
  static func lightness(_ r: UInt8, _ g: UInt8, _ b: UInt8) -> Float {
    let y = luminance(r, g, b)
    let f = y > epsilon ? cbrtf(y) : y / kappaSlope + offset
    return 116 * f - 16
  }

  /// The neutral sRGB grey (0...1) with the pixel's lightness: a Lab colour with a = b = 0 has the
  /// same luminance on all three channels, so this is just that luminance gamma-encoded.
  @inline(__always)
  static func grey(_ r: UInt8, _ g: UInt8, _ b: UInt8) -> Float {
    let y = luminance(r, g, b)
    return y <= 0.0031308 ? y * 12.92 : 1.055 * powf(y, 1 / 2.4) - 0.055
  }

  @inline(__always)
  static func writeRGB(l: Float, a: Float, b: Float, into output: inout [UInt8], at p: Int) {
    let fy = (l + 16) / 116
    let fx = fy + a / 500
    let fz = fy - b / 200
    @inline(__always) func inverse(_ t: Float) -> Float {
      t > 6 / 29 ? t * t * t : kappaSlope * (t - offset)
    }
    let x = 0.95047 * inverse(fx)
    let yy = inverse(fy)
    let z = 1.08883 * inverse(fz)
    let r = 3.2404542 * x - 1.5371385 * yy - 0.4985314 * z
    let g = -0.9692660 * x + 1.8760108 * yy + 0.0415560 * z
    let bl = 0.0556434 * x - 0.2040259 * yy + 1.0572252 * z
    output[p] = encode(r)
    output[p + 1] = encode(g)
    output[p + 2] = encode(bl)
  }

  @inline(__always)
  private static func encode(_ linear: Float) -> UInt8 {
    let clamped = min(max(linear, 0), 1)
    return toSRGB[Int(clamped * Float(gammaSteps) + 0.5)]
  }
}
