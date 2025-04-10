
import WidgetKit
import SwiftUI


struct SlideShowList: Widget {
    let kind: String = "SlideShowListWidget"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(
            kind: kind,
            provider: SlideShowProvider()
        ) { entry in
          SlideShowEntryView(entry: entry)
        }
        .configurationDisplayName("Подборка")
        .description("Подборка ранее просмотренных фотографий.")
        .supportedFamilies([.systemMedium, .systemLarge, .systemExtraLarge])
    }
}

#Preview(as: .systemLarge) {
  SlideShowList()
} timeline: {
  SlideShowEntry(
        date: .now,
        items: [
            HistoryListEntryItem(
                historyItem: HistoryItem(
                  cid: "1527279",
                  description: "1909 Россия, Челябинская область, Ашинский район",
                  file: "x/g/u/xgumjd0j2vk3n6v0e7.jpg",
                  title: "Вид у станции Симская"
                ),
                imageData: UIImage(named: "historySlidePreview")?.heicData()
            )
        ]
    )
}
