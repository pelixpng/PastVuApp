import WidgetKit
import SwiftUI


struct SlideShowEntry: TimelineEntry {
    let date: Date
    let items: [HistoryListEntryItem]
}

struct SlideShowEntryView: View {
    var entry: SlideShowProvider.Entry
    
    var body: some View {
        GeometryReader { geometry in
            if let item = entry.items.first {
                ZStack(alignment: .bottomLeading) {
                    imageView(for: item)
                        .aspectRatio(contentMode: .fill)
                        .frame(width: geometry.size.width, height: geometry.size.height)
                    VStack(alignment: .leading, spacing: 4) {
                        Text(item.historyItem.title)
                            .font(.system(size: 20))
                            .fontWeight(.bold)
                            .foregroundColor(.white)
                            .lineLimit(1)
                        Text(item.historyItem.description)
                            .font(.system(size: 14))
                            .foregroundColor(.white.opacity(0.9))
                            .lineLimit(1)
                    }
                    .padding()
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .bottomLeading)
                    .background(
                        LinearGradient(
                            gradient: Gradient(colors: [.clear, .black.opacity(0.6)]),
                            startPoint: .top,
                            endPoint: .bottom
                        )
                    )
                }
             
            } else {
                emptyView
            }
        }
        .containerBackground(.fill.tertiary, for: .widget)
        .padding(-18)
    }
    
  private var emptyView: some View {
      Text("Нет фото для просмотра")
          .font(.system(size: 12))
          .foregroundStyle(.secondary)
          .frame(maxWidth: .infinity, maxHeight: .infinity)
  }
    
    @ViewBuilder
    private func imageView(for item: HistoryListEntryItem) -> some View {
        if let data = item.imageData, let image = UIImage(data: data) {
            Image(uiImage: image)
                .resizable()
        } else {
            Color.gray
                .overlay(
                    Image(systemName: "photo")
                        .foregroundColor(.white)
                        .font(.system(size: 24))
                )
        }
    }
}
