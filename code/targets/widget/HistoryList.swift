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
struct HistoryListEntry: TimelineEntry {
    let date: Date
    let items: [HistoryListEntryItem]
}

// MARK: - View
struct HistoryEntryView: View {
    var entry: HistoryListProvider.Entry
    
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
    private func imageView(for item: HistoryListEntryItem) -> some View {
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
struct HistoryListWidget: Widget {
    let kind: String = "HistoryWidget"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(
            kind: kind,
            provider: HistoryListProvider()
        ) { entry in
          HistoryEntryView(entry: entry)
        }
        .configurationDisplayName("История")
        .description("Последние 5 просмотренных фотографий.")
        .supportedFamilies([.systemExtraLarge, .systemLarge])
    }
}

// MARK: - Preview
#Preview(as: .systemExtraLarge) {
  HistoryListWidget()
} timeline: {
  HistoryListEntry(
        date: .now,
        items: [
          HistoryListEntryItem(
                historyItem: HistoryItem(
                    cid: "1524279",
                    description: "1965 Сербия, Воеводина",
                    file: "x/g/u/xgumjd0j2vk3n6v0e7.jpg",
                    title: "Площадь свободы"
                ),
                imageData: UIImage(named: "historyListPreviewFirst")?.heicData()
            ),
          HistoryListEntryItem(
                historyItem: HistoryItem(
                    cid: "1019254",
                    description: "1842 Россия, Москва, ЦАО, Якиманка",
                    file: "o/5/h/o5h82vy426lwn46m9m.jpg",
                    title: "Возможно старейшее фото Москвы"
                ),
                imageData: UIImage(named: "historyListPreviewSecond")?.heicData()
            ),
          HistoryListEntryItem(
                historyItem: HistoryItem(
                    cid: "1019255",
                    description: "1985 Германия, Берлин, округ Митте, Митте",
                    file: "o/5/h/o5h82vy426lwn46m9m.jpg",
                    title: "Brandenburger Tor und Berliner Mauer von der Westseite"
                ),
                imageData: UIImage(named: "historyListPreviewThird")?.heicData()
            ),
          HistoryListEntryItem(
                historyItem: HistoryItem(
                    cid: "1019256",
                    description: "1902-1909 Россия, Санкт-Петербург, Петроградский район",
                    file: "o/5/h/o5h82vy426lwn46m9m.jpg",
                    title: "Народный дом Императора Николая II"
                ),
                imageData: UIImage(named: "historyListPreviewFourth")?.heicData()
            ),
          HistoryListEntryItem(
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

