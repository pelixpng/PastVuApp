import SwiftUI

class ImageLoader: ObservableObject {
    @Published var image: UIImage?
    
    private var url: URL?
    private var operation: BlockOperation?
    
    private static let sharedQueue: OperationQueue = {
        let queue = OperationQueue()
        queue.maxConcurrentOperationCount = 2
        return queue
    }()
    
    private static let imageCache = NSCache<NSString, UIImage>()
    
    init(url: URL) {
        self.url = url
        loadImage()
    }
    
    private func loadImage() {
        guard let url = url else { return }
        
        if let cachedImage = ImageLoader.imageCache.object(forKey: url.absoluteString as NSString) {
            DispatchQueue.main.async {
                self.image = cachedImage
            }
            return
        }
        
        let op = BlockOperation {
            let semaphore = DispatchSemaphore(value: 0)
            let request = URLRequest(url: url, cachePolicy: .returnCacheDataElseLoad, timeoutInterval: 30)
            let task = URLSession.shared.dataTask(with: request) { data, response, error in
                if let data = data, let uiImage = UIImage(data: data) {
                    ImageLoader.imageCache.setObject(uiImage, forKey: url.absoluteString as NSString)
                    DispatchQueue.main.async {
                        self.image = uiImage
                    }
                }
                semaphore.signal()
            }
            task.resume()
            semaphore.wait()
        }
        self.operation = op
        ImageLoader.sharedQueue.addOperation(op)
    }
    
    deinit {
        operation?.cancel()
    }
}

