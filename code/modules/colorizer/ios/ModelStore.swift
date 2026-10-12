import Compression
import CoreML
import CryptoKit
import Foundation

/// Where the colorization model lives once downloaded, and how a download becomes that model.
///
/// The model (224 MB) is not in the app: the app downloads it on first use as a zipped
/// Colorizer.mlpackage (see core/services/colorizerModel.ts), and this checks the zip against its
/// SHA-256, unpacks it and compiles it for this device. Compiling here rather than shipping a
/// compiled model keeps the download valid for every iOS version the app supports.
@available(iOS 16.0, macOS 13.0, *)
enum ModelStore {
  /// Application Support: kept until the app is removed, unlike caches, which iOS empties when it
  /// runs short of space. Left out of backups, as it can always be downloaded again.
  static var directory: URL {
    FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
      .appendingPathComponent("Colorizer", isDirectory: true)
  }

  static var modelURL: URL {
    directory.appendingPathComponent("Colorizer.mlmodelc", isDirectory: true)
  }

  /// The model is moved in only once complete, so being there means it is whole.
  static var isInstalled: Bool {
    FileManager.default.fileExists(atPath: modelURL.path)
  }

  /// Turns the downloaded zip into the installed model, deleting the zip on the way.
  static func install(zip: URL, sha256 expected: String) async throws {
    let files = FileManager.default
    defer { try? files.removeItem(at: zip) }
    guard try sha256(of: zip) == expected.lowercased() else { throw CorruptDownloadException() }

    try files.createDirectory(at: directory, withIntermediateDirectories: true)
    var settings = URLResourceValues()
    settings.isExcludedFromBackup = true
    var folder = directory
    try folder.setResourceValues(settings)

    let work = directory.appendingPathComponent("install-\(UUID().uuidString)", isDirectory: true)
    defer { try? files.removeItem(at: work) }
    try Unzip.extract(zip, to: work)
    try? files.removeItem(at: zip)
    let package = work.appendingPathComponent("Colorizer.mlpackage", isDirectory: true)
    guard files.fileExists(atPath: package.path) else { throw CorruptDownloadException() }

    let compiled = try await MLModel.compileModel(at: package)
    defer { try? files.removeItem(at: compiled) }
    try? files.removeItem(at: modelURL)
    try files.moveItem(at: compiled, to: modelURL)
  }

  /// Frees the space; the next palette press offers the download again.
  static func remove() throws {
    if FileManager.default.fileExists(atPath: directory.path) {
      try FileManager.default.removeItem(at: directory)
    }
  }

  private static func sha256(of url: URL) throws -> String {
    let handle = try FileHandle(forReadingFrom: url)
    defer { try? handle.close() }
    var hasher = SHA256()
    while let chunk = try handle.read(upToCount: 4 << 20), !chunk.isEmpty {
      hasher.update(data: chunk)
    }
    return hasher.finalize().map { String(format: "%02x", $0) }.joined()
  }
}

/// Just enough of ZIP for the model archive: stored and deflated entries, no ZIP64, no encryption.
/// iOS has no public unzip, and a library for one archive would cost more than these lines.
enum Unzip {
  static func extract(_ zip: URL, to destination: URL) throws {
    let data = try Data(contentsOf: zip, options: .alwaysMapped)
    let files = FileManager.default
    try files.createDirectory(at: destination, withIntermediateDirectories: true)
    let root = destination.standardizedFileURL.path

    try data.withUnsafeBytes { (raw: UnsafeRawBufferPointer) in
      func u16(_ at: Int) throws -> Int {
        guard at >= 0, at + 2 <= raw.count else { throw CorruptDownloadException() }
        return Int(raw[at]) | Int(raw[at + 1]) << 8
      }
      func u32(_ at: Int) throws -> Int {
        guard at >= 0, at + 4 <= raw.count else { throw CorruptDownloadException() }
        return try u16(at) | u16(at + 2) << 16
      }

      // The end-of-central-directory record: the last 22 bytes, unless a comment follows it.
      var end = raw.count - 22
      while end >= max(0, raw.count - 22 - 0xFFFF), try u32(end) != 0x0605_4B50 { end -= 1 }
      guard end >= 0, try u32(end) == 0x0605_4B50 else { throw CorruptDownloadException() }
      let count = try u16(end + 10)
      var entry = try u32(end + 16)

      for _ in 0..<count {
        guard try u32(entry) == 0x0201_4B50 else { throw CorruptDownloadException() }
        let method = try u16(entry + 10)
        let packed = try u32(entry + 20)
        let size = try u32(entry + 24)
        let nameLength = try u16(entry + 28)
        let local = try u32(entry + 42)
        guard packed != 0xFFFF_FFFF, size != 0xFFFF_FFFF, local != 0xFFFF_FFFF,
              entry + 46 + nameLength <= raw.count,
              let name = String(bytes: raw[(entry + 46)..<(entry + 46 + nameLength)], encoding: .utf8)
        else { throw CorruptDownloadException() }
        entry += try 46 + nameLength + u16(entry + 30) + u16(entry + 32)

        // Nothing may land outside the destination ("../" in a name).
        let target = destination.appendingPathComponent(name).standardizedFileURL
        guard target.path.hasPrefix(root + "/") else { throw CorruptDownloadException() }
        if name.hasSuffix("/") {
          try files.createDirectory(at: target, withIntermediateDirectories: true)
          continue
        }
        try files.createDirectory(
          at: target.deletingLastPathComponent(), withIntermediateDirectories: true)

        // The sizes come from the central directory: the local header may leave them zero.
        guard try u32(local) == 0x0403_4B50 else { throw CorruptDownloadException() }
        let start = try local + 30 + u16(local + 26) + u16(local + 28)
        guard start + packed <= raw.count else { throw CorruptDownloadException() }
        let source = UnsafeRawBufferPointer(rebasing: raw[start..<(start + packed)])

        guard files.createFile(atPath: target.path, contents: nil) else {
          throw CorruptDownloadException()
        }
        let output = try FileHandle(forWritingTo: target)
        defer { try? output.close() }
        switch method {
        case 0:
          guard packed == size else { throw CorruptDownloadException() }
          try output.write(contentsOf: Data(source))
        case 8:
          guard try inflate(source, into: output) == size else { throw CorruptDownloadException() }
        default:
          throw CorruptDownloadException()
        }
      }
    }
  }

  /// Raw DEFLATE (what ZIP stores) in 1 MB steps, so a 230 MB entry never sits in memory whole.
  private static func inflate(_ source: UnsafeRawBufferPointer, into output: FileHandle) throws -> Int {
    let stream = UnsafeMutablePointer<compression_stream>.allocate(capacity: 1)
    defer { stream.deallocate() }
    // COMPRESSION_ZLIB is raw DEFLATE, without the zlib header.
    guard compression_stream_init(stream, COMPRESSION_STREAM_DECODE, COMPRESSION_ZLIB)
      == COMPRESSION_STATUS_OK
    else { throw CorruptDownloadException() }
    defer { compression_stream_destroy(stream) }

    let capacity = 1 << 20
    let buffer = UnsafeMutablePointer<UInt8>.allocate(capacity: capacity)
    defer { buffer.deallocate() }
    stream.pointee.src_ptr = source.baseAddress!.assumingMemoryBound(to: UInt8.self)
    stream.pointee.src_size = source.count
    var written = 0
    while true {
      stream.pointee.dst_ptr = buffer
      stream.pointee.dst_size = capacity
      let status = compression_stream_process(stream, Int32(COMPRESSION_STREAM_FINALIZE.rawValue))
      guard status != COMPRESSION_STATUS_ERROR else { throw CorruptDownloadException() }
      let produced = capacity - stream.pointee.dst_size
      if produced > 0 {
        try output.write(contentsOf: Data(bytesNoCopy: buffer, count: produced, deallocator: .none))
        written += produced
      }
      if status == COMPRESSION_STATUS_END { return written }
      // No progress and no end: the data stopped short.
      guard produced > 0 || stream.pointee.src_size > 0 else { throw CorruptDownloadException() }
    }
  }
}
