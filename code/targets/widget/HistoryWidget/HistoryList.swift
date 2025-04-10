import WidgetKit
import SwiftUI

struct HistoryList: Widget {
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

#Preview(as: .systemExtraLarge) {
  HistoryList()
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
                    description: "1947 Германия, Берлин, округ Митте, Тиргартен",
                    file: "o/5/h/o5h82vy426lwn46m9m.jpg",
                    title: "Die Ruine des Reichstagsgebäudes"
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




