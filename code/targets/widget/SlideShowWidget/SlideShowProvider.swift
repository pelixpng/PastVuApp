import WidgetKit
import SwiftUI

struct SlideShowProvider: TimelineProvider {
    private let displayInterval: TimeInterval = 1800
    
    func placeholder(in context: Context) -> SlideShowEntry {
      SlideShowEntry(date: Date(), items: loadSampleItems())
    }
    
    func getSnapshot(in context: Context, completion: @escaping (SlideShowEntry) -> Void) {
        if context.isPreview {
            let sampleItems = loadSampleItems()
            let entry = SlideShowEntry(date: Date(), items: sampleItems)
            completion(entry)
        } else {
            let items = fetchItems().prefix(5).map { HistoryListEntryItem(historyItem: $0, imageData: nil) }
            let entry = SlideShowEntry(date: Date(), items: Array(items))
            completion(entry)
        }
    }
  
  func getTimeline(in context: Context, completion: @escaping (Timeline<SlideShowEntry>) -> Void) {
      Task {
          let historyItems = fetchItems()
          let entryItems = await processItems(historyItems)
          
          let currentDate = Date()
          var entries: [SlideShowEntry] = []
          
          if entryItems.isEmpty {
              let entry = SlideShowEntry(date: currentDate, items: [])
              let timeline = Timeline(entries: [entry], policy: .after(currentDate.addingTimeInterval(displayInterval)))
              completion(timeline)
              return
          }
          
          for (index, item) in entryItems.enumerated() {
              let entryDate = currentDate.addingTimeInterval(TimeInterval(index) * displayInterval)
              let entry = SlideShowEntry(date: entryDate, items: [item])
              entries.append(entry)
          }
          
          let timeline = Timeline(entries: entries, policy: .after(currentDate.addingTimeInterval(displayInterval * Double(entryItems.count))))
          completion(timeline)
      }
  }

    
    private func loadSampleItems() -> [HistoryListEntryItem] {
        let sampleHistoryItems = [
            HistoryItem(
                cid: "1527279",
                description: "1909 Россия, Челябинская область, Ашинский район",
                file: "x/g/u/xgumjd0j2vk3n6v0e7.jpg",
                title: "Вид у станции Симская"
            )
        ]
        
        return sampleHistoryItems.map {
            HistoryListEntryItem(
                historyItem: $0,
                imageData: UIImage(named: "historySlidePreview")?.heicData()
            )
        }
    }
    
    private func fetchItems() -> [HistoryItem] {
        guard let defaults = UserDefaults(suiteName: "group.com.pelixpng.PastVuApp"),
              let jsonString = defaults.string(forKey: "History"),
              let data = jsonString.data(using: .utf8) else {
            return []
        }
        do {
            return try JSONDecoder().decode([HistoryItem].self, from: data)
        } catch {
            print("Decoding error: \(error)")
            return []
        }
    }
    
    private func processItems(_ items: [HistoryItem]) async -> [HistoryListEntryItem] {
        return await withTaskGroup(of: HistoryListEntryItem.self) { group in
            for item in items.prefix(5) {
                group.addTask {
                    let imageData = await self.loadImageData(for: item.file)
                    return HistoryListEntryItem(historyItem: item, imageData: imageData)
                }
            }
            
            var results = [HistoryListEntryItem]()
            for await result in group {
                results.append(result)
            }
            return results.sorted { $0.historyItem.cid < $1.historyItem.cid }
        }
    }
    
    private func loadImageData(for file: String) async -> Data? {
        guard let url = URL(string: "https://pastvu.com/_p/d/\(file)") else { return nil }
        do {
            let (data, _) = try await URLSession.shared.data(from: url)
            return data
        } catch {
            print("Image load error: \(error)")
            return nil
        }
    }
}


