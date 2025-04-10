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
    var imageURL: URL? {
        URL(string: "https://img.pastvu.com/h/\(file)")
    }
}
