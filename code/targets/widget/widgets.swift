import WidgetKit
import SwiftUI

// MARK: - Модели данных
struct HistoryItem: Codable {
    let cid: String
    let description: String
    let file: String
    let title: String
}

struct HistoryEntryItem: Identifiable {
    let id: String
    let historyItem: HistoryItem
    let imageData: Data?
    
    init(historyItem: HistoryItem, imageData: Data?) {
        self.id = historyItem.cid
        self.historyItem = historyItem
        self.imageData = imageData
    }
}

// MARK: - Timeline Provider
struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(date: Date(), items: [])
    }
  
  func getSnapshot(in context: Context, completion: @escaping (SimpleEntry) -> Void) {
          if context.isPreview {
              let sampleItems = loadSampleItems()
              let entry = SimpleEntry(date: Date(), items: sampleItems)
              completion(entry)
          } else {
              let items = fetchItems().prefix(5).map { HistoryEntryItem(historyItem: $0, imageData: nil) }
              let entry = SimpleEntry(date: Date(), items: Array(items))
              completion(entry)
          }
      }
      
      private func loadSampleItems() -> [HistoryEntryItem] {
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
          
          var items = [HistoryEntryItem]()
          for (index, item) in sampleHistoryItems.enumerated() {
              let imageName = sampleImages[index]
              let imageData = UIImage(named: imageName)?.jpegData(compressionQuality: 1.0)
              items.append(HistoryEntryItem(historyItem: item, imageData: imageData))
          }
          return items
      }
    
    func getTimeline(in context: Context, completion: @escaping (Timeline<SimpleEntry>) -> Void) {
        Task {
            let historyItems = fetchItems()
            let entryItems = await processItems(historyItems)
            let entry = SimpleEntry(date: Date(), items: entryItems)
            let timeline = Timeline(entries: [entry], policy: .after(Date().addingTimeInterval(3600)))
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
    
  
  private func processItems(_ items: [HistoryItem]) async -> [HistoryEntryItem] {
      return await withTaskGroup(of: HistoryEntryItem.self) { group in
          for item in items.prefix(5) {
              group.addTask {
                  let imageData = await self.loadImageData(for: item.file)
                  return HistoryEntryItem(historyItem: item, imageData: imageData)
              }
          }
          
          var results = [HistoryEntryItem]()
          for await result in group {
              results.append(result)
          }
          return results
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

// MARK: - Timeline Entry
struct SimpleEntry: TimelineEntry {
    let date: Date
    let items: [HistoryEntryItem]
}

// MARK: - View
struct widgetEntryView: View {
    var entry: Provider.Entry
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            if entry.items.isEmpty {
                emptyView
            } else {
                listView
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .containerBackground(.fill.tertiary, for: .widget)
    }
    
    private var emptyView: some View {
        Text("No recent items")
            .font(.system(size: 12))
            .foregroundStyle(.secondary)
            .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
  
    var isIPhoneSE3: Bool {
          let screenHeight = UIScreen.main.bounds.height
          return screenHeight == 667
      }
    
    private var listView: some View {
        ForEach(entry.items) { item in
          HStack(alignment: .top, spacing: 8) {
                imageView(for: item)
                VStack(alignment: .leading, spacing: 3) {
                          Text(item.historyItem.title)
                              .font(.system(size: 12)).bold()
                              .lineLimit(1)

                          Text(item.historyItem.description)
                              .font(.system(size: 10))
                              .fontWeight(.medium)
                              .lineLimit(2)
                }
            }
            .padding(.vertical, 2)
        }
    }
    
    @ViewBuilder
    private func imageView(for item: HistoryEntryItem) -> some View {
        if let data = item.imageData, let image = UIImage(data: data) {
            Image(uiImage: image)
                .resizable()
                .scaledToFill()
                .frame(width: 80, height: isIPhoneSE3 ? 53 : 59)
                .clipShape(RoundedRectangle(cornerRadius: 10))
        } else {
            Color.gray
                .frame(width: 80, height: isIPhoneSE3 ? 53 : 59)
                .clipShape(RoundedRectangle(cornerRadius: 10))
                .overlay(
                    Image(systemName: "photo")
                        .foregroundColor(.white)
                        .font(.system(size: 12))
                )
        }
    }
}

// MARK: - Widget Configuration
struct widget: Widget {
    let kind: String = "HistoryWidget"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(
            kind: kind,
            provider: Provider()
        ) { entry in
            widgetEntryView(entry: entry)
        }
        .configurationDisplayName("Viewing History")
        .description("Displays recently viewed items")
        .supportedFamilies([.systemExtraLarge, .systemLarge])
    }
}

// MARK: - Preview
#Preview(as: .systemExtraLarge) {
    widget()
} timeline: {
    SimpleEntry(
        date: .now,
        items: [
            HistoryEntryItem(
                historyItem: HistoryItem(
                    cid: "1524279",
                    description: "1965 Сербия, Воеводина",
                    file: "x/g/u/xgumjd0j2vk3n6v0e7.jpg",
                    title: "Площадь свободы"
                ),
                imageData: UIImage(named: "historyListPreviewFirst")?.heicData()
            ),
            HistoryEntryItem(
                historyItem: HistoryItem(
                    cid: "1019254",
                    description: "1842 Россия, Москва, ЦАО, Якиманка",
                    file: "o/5/h/o5h82vy426lwn46m9m.jpg",
                    title: "Возможно старейшее фото Москвы"
                ),
                imageData: UIImage(named: "historyListPreviewSecond")?.heicData()
            ),
            HistoryEntryItem(
                historyItem: HistoryItem(
                    cid: "1019255",
                    description: "1985 Германия, Берлин, округ Митте, Митте",
                    file: "o/5/h/o5h82vy426lwn46m9m.jpg",
                    title: "Brandenburger Tor und Berliner Mauer von der Westseite"
                ),
                imageData: UIImage(named: "historyListPreviewThird")?.heicData()
            ),
            HistoryEntryItem(
                historyItem: HistoryItem(
                    cid: "1019256",
                    description: "1902-1909 Россия, Санкт-Петербург, Петроградский район",
                    file: "o/5/h/o5h82vy426lwn46m9m.jpg",
                    title: "Народный дом Императора Николая II"
                ),
                imageData: UIImage(named: "historyListPreviewFourth")?.heicData()
            ),
            HistoryEntryItem(
                historyItem: HistoryItem(
                    cid: "1019257",
                    description: "1907-1917 Россия, Челябинская область, Челябинск",
                    file: "o/5/h/o5h82vy426lwn46m9m.jpg",
                    title: "Мост через Миасс"
                ),
                imageData: UIImage(named: "historyListPreviewFifth")?.heicData()
            ),
        ]
    )
}
