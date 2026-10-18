import UIKit

/// The "AI COLORIZATION" mark on colourised photos, asked for by the PastVu community: a colourisation is the
/// model's guess, and a copy passed on without the app around it should still say so. The same
/// look and numbers as the Android module (Watermark.kt).
enum Watermark {
  private static let label = "AI COLORIZATION"

  /// Copies the photo with the mark in its bottom right corner, above PastVu's caption bar, to
  /// `<name>-ai.jpg` in the caches directory, replacing an earlier copy. The source stays as it is.
  static func add(toFileAt url: URL) throws -> URL {
    try autoreleasepool {
      // UIImage applies the EXIF orientation, so the mark lands in the corner the viewer sees; at
      // scale 1 its points are the photo's pixels, so nothing is resampled.
      guard let data = try? Data(contentsOf: url),
            let photo = UIImage(data: data, scale: 1),
            photo.size.width >= 1, photo.size.height >= 1
      else { throw UnreadablePhotoException(url.path) }
      let size = photo.size
      let format = UIGraphicsImageRendererFormat()
      format.scale = 1
      format.opaque = true
      // 8-bit sRGB, as colorize writes it: the automatic range draws in extended colour on
      // wide-gamut screens and would shift the photo's colours on the way back to JPEG.
      format.preferredRange = .standard
      let marked = UIGraphicsImageRenderer(size: size, format: format).image { context in
        photo.draw(in: CGRect(origin: .zero, size: size))
        // The colouriser leaves the caption bar grey, so its own check finds the bar on the result.
        // The snapshot is let go before the mark is drawn, so the buffer is not copied.
        let caption = autoreleasepool { context.currentImage.cgImage.map { captionRows(of: $0) } ?? 0 }
        drawMark(
          in: context.cgContext, width: size.width, bottom: size.height - CGFloat(caption),
          side: min(size.width, size.height)
        )
      }
      let caches = FileManager.default.urls(for: .cachesDirectory, in: .userDomainMask)[0]
      let output = caches.appendingPathComponent("\(url.deletingPathExtension().lastPathComponent)-ai.jpg")
      guard let jpeg = marked.jpegData(compressionQuality: 0.92) else { throw UnwritablePhotoException(output.path) }
      do {
        try jpeg.write(to: output, options: .atomic)
      } catch {
        throw UnwritablePhotoException(output.path)
      }
      return output
    }
  }

  /// A rounded pill with the label in white, sized by the photo's shorter side so it reads alike on
  /// every photo, its bottom a margin above `bottom`: the caption bar's top, or the photo's edge.
  private static func drawMark(in context: CGContext, width: CGFloat, bottom: CGFloat, side: CGFloat) {
    let height = max((0.07 * side).rounded(), 22)
    let margin = max((0.03 * side).rounded(), 8)
    let font = UIFont.systemFont(ofSize: 0.62 * height, weight: .bold)
    let attributes: [NSAttributedString.Key: Any] = [.font: font, .foregroundColor: UIColor.white]
    let textWidth = (label as NSString).size(withAttributes: attributes).width
    let pillWidth = max(textWidth + 2 * 0.45 * height, height)
    let pill = CGRect(x: width - margin - pillWidth, y: bottom - margin - height, width: pillWidth, height: height)
    // Circular ends, as on Android: UIBezierPath rounds its corners in a continuous curve.
    context.addPath(CGPath(roundedRect: pill, cornerWidth: height / 2, cornerHeight: height / 2, transform: nil))
    context.setFillColor(CGColor(srgbRed: 0, green: 0, blue: 0, alpha: 0.5))
    context.fillPath()
    // Centred on the capitals rather than the line, which leaves room for descenders.
    (label as NSString).draw(
      at: CGPoint(x: pill.midX - textWidth / 2, y: pill.midY + font.capHeight / 2 - font.ascender),
      withAttributes: attributes
    )
  }

  /// Rows of PastVu's caption bar, counted as the colouriser counts them; none when the photo cannot
  /// be read back.
  private static func captionRows(of image: CGImage) -> Int {
    let width = image.width
    let height = image.height
    var rgba = [UInt8](repeating: 0, count: width * height * 4)
    let drawn = rgba.withUnsafeMutableBytes { bytes -> Bool in
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
      context.draw(image, in: CGRect(x: 0, y: 0, width: width, height: height))
      // Grey, as colorize saw the original: JPEG bleeds the photo's colour into the bar's top rows,
      // which the tint test would stop at.
      for p in stride(from: 0, to: width * height * 4, by: 4) {
        let grey = UInt8((Int(bytes[p]) + Int(bytes[p + 1]) + Int(bytes[p + 2])) / 3)
        bytes[p] = grey
        bytes[p + 1] = grey
        bytes[p + 2] = grey
      }
      return true
    }
    return drawn ? PhotoColorizer.shared.captionRows(rgba, width: width, height: height) : 0
  }
}
