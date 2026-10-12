import CoreGraphics
import Foundation
import ImageIO

/// Tells black-and-white photos from colour ones, so the palette button shows only where colouring
/// makes sense. PastVu does not say which photos are colour, so the pixels decide.
///
/// Old prints are rarely neutral grey: sepia, toning and yellowed paper tint them, and the tint
/// follows the lightness (dark browns, cream highlights) while drifting a little across the print.
/// So the colour of each pixel is predicted from its lightness alone, and a photo counts as colour
/// when enough pixels stray far from that prediction: a blue sky over warm stone, a red flag.
///
/// Tuned on 119 PastVu thumbnails (/h/, 1900–2000) in Moscow, St Petersburg, Kyiv and Paris: every
/// black-and-white print scored at most 0.03, every photo above the threshold was colour. Faded or
/// muted colour photos (grey stone, white sky) can score lower and keep the button, which only
/// costs a recolouring.
enum MonochromeCheck {
  /// The side the photo is reduced to: colour areas survive it, JPEG noise and grain do not.
  private static let side = 64
  /// Mounts, torn corners and scanner edges carry their own tint, so the border is left out.
  private static let crop = 0.06
  /// How far (in a, b of CIE Lab) a pixel must stray from the tint to count as coloured.
  private static let distance = 10.0
  /// The share of such pixels above which the photo is colour.
  private static let threshold = 0.06

  static func isMonochrome(fileAt url: URL) -> Bool? {
    guard let source = CGImageSourceCreateWithURL(url as CFURL, nil),
          let image = CGImageSourceCreateImageAtIndex(source, 0, nil),
          let rgba = pixels(of: image)
    else { return nil }

    let count = side * side
    var l = [Double](repeating: 0, count: count)
    var a = l
    var b = l
    for i in 0..<count {
      (l[i], a[i], b[i]) = lab(rgba[i * 4], rgba[i * 4 + 1], rgba[i * 4 + 2])
    }
    guard let tintA = fit(a, against: l), let tintB = fit(b, against: l) else { return true }
    var coloured = 0
    for i in 0..<count {
      let x = l[i]
      let da = a[i] - (tintA.0 + tintA.1 * x + tintA.2 * x * x)
      let db = b[i] - (tintB.0 + tintB.1 * x + tintB.2 * x * x)
      if da * da + db * db > distance * distance { coloured += 1 }
    }
    return Double(coloured) / Double(count) <= threshold
  }

  /// The middle of the photo, without its border, as RGBA in sRGB at side × side.
  private static func pixels(of image: CGImage) -> [UInt8]? {
    let inset = CGRect(x: 0, y: 0, width: image.width, height: image.height)
      .insetBy(dx: Double(image.width) * crop, dy: Double(image.height) * crop)
      .integral
    guard let middle = image.cropping(to: inset),
          let space = CGColorSpace(name: CGColorSpace.sRGB)
    else { return nil }
    var data = [UInt8](repeating: 0, count: side * side * 4)
    let drawn = data.withUnsafeMutableBytes { bytes -> Bool in
      guard let context = CGContext(
        data: bytes.baseAddress,
        width: side,
        height: side,
        bitsPerComponent: 8,
        bytesPerRow: side * 4,
        space: space,
        bitmapInfo: CGImageAlphaInfo.noneSkipLast.rawValue
      ) else { return false }
      context.interpolationQuality = .high
      context.draw(middle, in: CGRect(x: 0, y: 0, width: side, height: side))
      return true
    }
    return drawn ? data : nil
  }

  /// The tint as a quadratic in lightness, by least squares: y ≈ c0 + c1·L + c2·L².
  private static func fit(_ y: [Double], against l: [Double]) -> (Double, Double, Double)? {
    // Normal equations: sums of L^0...L^4 on the left, of y·L^0...y·L^2 on the right.
    var s = [Double](repeating: 0, count: 5)
    var t = [Double](repeating: 0, count: 3)
    for i in 0..<y.count {
      var p = 1.0
      for k in 0..<5 {
        s[k] += p
        if k < 3 { t[k] += y[i] * p }
        p *= l[i]
      }
    }
    let m = [[s[0], s[1], s[2]], [s[1], s[2], s[3]], [s[2], s[3], s[4]]]
    func det(_ m: [[Double]]) -> Double {
      m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1])
        - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0])
        + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0])
    }
    let d = det(m)
    // A flat photo (one lightness throughout) has no curve to fit; it has no colour either.
    guard abs(d) > 1e-9 * max(1, abs(s[4] * s[2] * s[0])) else { return nil }
    func replaced(_ column: Int) -> [[Double]] {
      m.enumerated().map { row, values in
        values.enumerated().map { $0.offset == column ? t[row] : $0.element }
      }
    }
    return (det(replaced(0)) / d, det(replaced(1)) / d, det(replaced(2)) / d)
  }

  /// CIE Lab of an sRGB pixel, D65 white.
  private static func lab(_ r: UInt8, _ g: UInt8, _ b: UInt8) -> (Double, Double, Double) {
    func linear(_ v: UInt8) -> Double {
      let c = Double(v) / 255
      return c <= 0.04045 ? c / 12.92 : pow((c + 0.055) / 1.055, 2.4)
    }
    func f(_ t: Double) -> Double {
      t > 216.0 / 24389 ? cbrt(t) : t / (3 * (6.0 / 29) * (6.0 / 29)) + 4.0 / 29
    }
    let (lr, lg, lb) = (linear(r), linear(g), linear(b))
    let x = (0.4124564 * lr + 0.3575761 * lg + 0.1804375 * lb) / 0.95047
    let y = 0.2126729 * lr + 0.7151522 * lg + 0.0721750 * lb
    let z = (0.0193339 * lr + 0.1191920 * lg + 0.9503041 * lb) / 1.08883
    let (fx, fy, fz) = (f(x), f(y), f(z))
    return (116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz))
  }
}
