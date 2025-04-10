import WidgetKit
import SwiftUI

struct HistoryListProvider: TimelineProvider {
    func placeholder(in context: Context) -> HistoryListEntry {
      HistoryListEntry(date: Date(), items: [])
    }
  
  func getSnapshot(in context: Context, completion: @escaping (HistoryListEntry) -> Void) {
          if context.isPreview {
              let sampleItems = loadSampleItems()
              let entry = HistoryListEntry(date: Date(), items: sampleItems)
              completion(entry)
          } else {
              let items = fetchItems().prefix(5).map { HistoryListEntryItem(historyItem: $0, imageData: nil) }
              let entry = HistoryListEntry(date: Date(), items: Array(items))
              completion(entry)
          }
      }
      
      private func loadSampleItems() -> [HistoryListEntryItem] {
          let sampleImages = [
              "historyListPreviewFirst",
              "historyListPreviewSecond",
              "historyListPreviewThird",
              "historyListPreviewFourth",
              "historyListPreviewFifth"
          ]
          
          let sampleHistoryItems = [
              HistoryItem(
                  cid: "1524279",
                  description: "1965 Сербия, Воеводина",
                  file: "x/g/u/xgumjd0j2vk3n6v0e7.jpg",
                  title: "Площадь свободы"
              ),
              HistoryItem(
                  cid: "1019254",
                  description: "1842 Россия, Москва, ЦАО, Якиманка",
                  file: "o/5/h/o5h82vy426lwn46m9m.jpg",
                  title: "Возможно старейшее фото Москвы"
              ),
              HistoryItem(
                  cid: "1019255",
                  description: "1985 Германия, Берлин, округ Митте, Митте",
                  file: "o/5/h/o5h82vy426lwn46m9m.jpg",
                  title: "Brandenburger Tor und Berliner Mauer von der Westseite"
              ),
              HistoryItem(
                  cid: "1019256",
                  description: "1902-1909 Россия, Санкт-Петербург, Петроградский район",
                  file: "o/5/h/o5h82vy426lwn46m9m.jpg",
                  title: "Народный дом Императора Николая II"
              ),
              HistoryItem(
                  cid: "1019257",
                  description: "1907-1917 Россия, Челябинская область, Челябинск",
                  file: "o/5/h/o5h82vy426lwn46m9m.jpg",
                  title: "Мост через Миасс"
              )
          ]
          
          var items = [HistoryListEntryItem]()
          for (index, item) in sampleHistoryItems.enumerated() {
              let imageName = sampleImages[index]
              let imageData = UIImage(named: imageName)?.jpegData(compressionQuality: 1.0)
              items.append(HistoryListEntryItem(historyItem: item, imageData: imageData))
          }
          return items
      }
    
    func getTimeline(in context: Context, completion: @escaping (Timeline<HistoryListEntry>) -> Void) {
        Task {
          let historyItems = fetchItems()
          let entryItems = await processItems(historyItems)
          let entry = HistoryListEntry(date: Date(), items: entryItems)
          let timeline = Timeline(entries: [entry], policy: .never)
          completion(timeline)
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
          return results
      }
  }
    
    private func loadImageData(for file: String) async -> Data? {
        guard let url = URL(string: "https://img.pastvu.com/d/\(file)") else { return nil }
        do {
            let (data, _) = try await URLSession.shared.data(from: url)
          return data
        } catch {
            print("Image load error: \(error)")
            return nil
        }
    }
}

