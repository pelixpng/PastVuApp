import SwiftUI
import ImageIO
import WatchKit

/// Loads a photo for the list, scaled down on decode to what the screen can show.
///
/// A standard-size PastVu photo (up to 1050 px) decoded at full size takes several megabytes,
/// and thirty of them do not fit in a watch's memory. Decoding straight to the size of a card
/// keeps each one well under a megabyte.
final class ImageLoader: ObservableObject {
    enum State {
        case loading
        case loaded(UIImage)
        /// The file is gone (PastVu keeps removed photos' records) or the download failed.
        case failed
    }

    @Published private(set) var state: State = .loading

    private let url: URL
    private var task: URLSessionDataTask?

    private static let cache: NSCache<NSURL, UIImage> = {
        let cache = NSCache<NSURL, UIImage>()
        cache.countLimit = 40
        return cache
    }()

    /// The card the photo fills, in pixels: the full screen width at 4:3.
    private static let cardPixels: CGSize = {
        let device = WKInterfaceDevice.current()
        let width = device.screenBounds.width * device.screenScale
        return CGSize(width: width, height: width * 3 / 4)
    }()

    init(url: URL) {
        self.url = url
        if let cached = Self.cache.object(forKey: url as NSURL) {
            state = .loaded(cached)
            return
        }
        let request = URLRequest(url: url, cachePolicy: .returnCacheDataElseLoad, timeoutInterval: 30)
        task = URLSession.shared.dataTask(with: request) { [weak self] data, _, _ in
            let image = data.flatMap(Self.downsample)
            if let image {
                Self.cache.setObject(image, forKey: url as NSURL)
            }
            DispatchQueue.main.async {
                self?.state = image.map { .loaded($0) } ?? .failed
            }
        }
        task?.resume()
    }

    deinit {
        task?.cancel()
    }

    /// Decodes just enough pixels for the photo to cover a card, whatever its shape.
    private static func downsample(_ data: Data) -> UIImage? {
        let sourceOptions = [kCGImageSourceShouldCache: false] as CFDictionary
        guard let source = CGImageSourceCreateWithData(data as CFData, sourceOptions),
              let properties = CGImageSourceCopyPropertiesAtIndex(source, 0, nil) as? [CFString: Any],
              let width = properties[kCGImagePropertyPixelWidth] as? CGFloat,
              let height = properties[kCGImagePropertyPixelHeight] as? CGFloat,
              width > 0, height > 0
        else { return nil }

        // Covering the card: the photo is scaled until both sides reach it, then cropped.
        let scale = min(1, max(cardPixels.width / width, cardPixels.height / height))
        let options = [
            kCGImageSourceCreateThumbnailFromImageAlways: true,
            kCGImageSourceCreateThumbnailWithTransform: true,
            kCGImageSourceShouldCacheImmediately: true,
            kCGImageSourceThumbnailMaxPixelSize: max(width, height) * scale,
        ] as CFDictionary
        guard let cgImage = CGImageSourceCreateThumbnailAtIndex(source, 0, options) else { return nil }
        return UIImage(cgImage: cgImage)
    }
}
