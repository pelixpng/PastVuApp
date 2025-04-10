import WidgetKit
import SwiftUI

struct HistoryListEntry: TimelineEntry {
    let date: Date
    let items: [HistoryListEntryItem]
}

struct HistoryEntryView: View {
    var entry: HistoryListProvider.Entry

    var body: some View {
        VStack(alignment: .leading) {
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
        Text("Нет фото для просмотра")
            .font(.system(size: 12))
            .foregroundStyle(.secondary)
            .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
  
    @ViewBuilder
    private func imageView(for item: HistoryListEntryItem, cellHeight: CGFloat) -> some View {
        if let data = item.imageData, let image = UIImage(data: data) {
            Image(uiImage: image)
                .resizable()
                .scaledToFill()
                .frame(width: 90, height: cellHeight) // фиксированная высота ячейки
                .clipShape(RoundedRectangle(cornerRadius: 10))
        } else {
            Color.gray
                .frame(width: 90, height: cellHeight)
                .clipShape(RoundedRectangle(cornerRadius: 10))
                .overlay(
                    Image(systemName: "photo")
                        .foregroundColor(.white)
                        .font(.system(size: 12))
                )
        }
    }
  
    private var listView: some View {
        GeometryReader { geo in
            let spacing: CGFloat = 6
            let maxItems = geo.size.width < 320 ? 4 : 5
            let itemsToDisplay = Array(entry.items.prefix(maxItems))
            let totalSpacing = spacing * CGFloat(max(itemsToDisplay.count - 1, 0))
            let cellHeight = min((geo.size.height - totalSpacing) / CGFloat(max(itemsToDisplay.count, 1)), 70)
            
            VStack(alignment: .leading, spacing: spacing) {
                ForEach(itemsToDisplay) { item in
                    HStack(alignment: .top, spacing: 8) {
                        imageView(for: item, cellHeight: cellHeight)
                        VStack(alignment: .leading, spacing: 3) {
                            Text(item.historyItem.title)
                                .font(.system(size: 13))
                                .bold()
                                .lineLimit(1)
                            
                            Text(item.historyItem.description)
                                .font(.system(size: 10))
                                .fontWeight(.medium)
                                .lineLimit(2)
                        }
                    }
                    .frame(height: cellHeight)
                    .frame(maxWidth: .infinity, alignment: .leading)
                }
            }
            .frame(width: geo.size.width, height: geo.size.height, alignment: .top)
        }
        .clipped()
    }
}
