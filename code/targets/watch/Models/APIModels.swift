import SwiftUI

struct APIResponse: Decodable {
    let result: PhotoResult
    let rid: String?
}

struct PhotoResult: Decodable {
    let photos: [Photo]
}

struct Photo: Identifiable, Decodable {
    let s: Int
    let cid: Int
    let file: String
    let title: String
    let dir: String?
    let geo: [Double]
    let year: Int?
    let ccount: Int?
  
    var id: Int { cid }
    /// The standard size, up to 1050 px: the thumbnail ("h", 246 px wide) blurs across a card as
    /// wide as the screen. ImageLoader scales it down to the card on decode.
    var imageURL: URL {
        URL(string: "https://img.pastvu.com/d/\(file)") ?? URL(string: "https://img.pastvu.com/")!
    }
}
