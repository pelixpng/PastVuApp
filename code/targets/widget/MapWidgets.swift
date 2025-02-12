//import WidgetKit
//import SwiftUI
//import MapKit
//
//// MARK: - Модели для декодирования JSON
//
//struct APIResponse: Codable {
//    let result: ResultData
//}
//
//struct ResultData: Codable {
//    let photos: [Photo]
//}
//
//struct Photo: Codable {
//    let geo: [Double]
//}
//
//// MARK: - Entry и Provider
//
//struct MapWidgetEntry: TimelineEntry {
//    let date: Date
//    let image: UIImage?
//}
//
//struct MapWidgetProvider: TimelineProvider {
//    typealias Entry = MapWidgetEntry
//    
//    // Координаты для карты (пример: Москва)
//    private let coordinate = CLLocationCoordinate2D(
//        latitude: 45.2352,
//        longitude: 19.8467
//    )
//    
//    // Размеры для большого виджета
//    private let widgetSize = CGSize(width: 329, height: 345)
//    
//    func placeholder(in context: Context) -> MapWidgetEntry {
//      MapWidgetEntry(date: Date(), image: nil)
//    }
//
//    func getSnapshot(in context: Context, completion: @escaping (MapWidgetEntry) -> Void) {
//        loadData { image in
//            let entry = MapWidgetEntry(date: Date(), image: image)
//            completion(entry)
//        }
//    }
//
//    func getTimeline(in context: Context, completion: @escaping (Timeline<MapWidgetEntry>) -> Void) {
//        loadData { image in
//            let entry = MapWidgetEntry(date: Date(), image: image)
//            let timeline = Timeline(entries: [entry], policy: .after(Date().addingTimeInterval(3600)))
//            completion(timeline)
//        }
//    }
//    
//    private func loadData(completion: @escaping (UIImage?) -> Void) {
//        fetchPhotos { photos in
//            self.generateMapSnapshot(with: photos, completion: completion)
//        }
//    }
//    
//    private func fetchPhotos(completion: @escaping ([Photo]) -> Void) {
//        let urlString = "https://pastvu.com/api2?method=photo.giveNearestPhotos&params={\"geo\":[\(coordinate.latitude),\(coordinate.longitude)],\"limit\":30}"
//        
//        guard let encoded = urlString.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed),
//              let url = URL(string: encoded) else {
//            completion([])
//            return
//        }
//        
//        URLSession.shared.dataTask(with: url) { data, _, error in
//            guard let data = data, error == nil else {
//                completion([])
//                return
//            }
//            
//            do {
//                let response = try JSONDecoder().decode(APIResponse.self, from: data)
//                completion(response.result.photos)
//            } catch {
//                completion([])
//            }
//        }.resume()
//    }
//    
//    private func generateMapSnapshot(with photos: [Photo], completion: @escaping (UIImage?) -> Void) {
//        let options = MKMapSnapshotter.Options()
//        options.region = MKCoordinateRegion(
//            center: coordinate,
//            span: MKCoordinateSpan(latitudeDelta: 0.01, longitudeDelta: 0.01)
//        )
//        options.size = widgetSize
//        options.scale = UIScreen.main.scale
//        
//        let snapshotter = MKMapSnapshotter(options: options)
//        
//        snapshotter.start { snapshot, error in
//            guard let snapshot = snapshot else {
//                completion(nil)
//                return
//            }
//            
//            let image = self.addMarkers(to: snapshot.image, using: snapshot, photos: photos)
//            completion(image)
//        }
//    }
//    
//    private func addMarkers(to image: UIImage, using snapshot: MKMapSnapshotter.Snapshot, photos: [Photo]) -> UIImage {
//        let renderer = UIGraphicsImageRenderer(size: image.size)
//        
//        return renderer.image { context in
//            image.draw(at: .zero)
//            
//            for photo in photos {
//                guard photo.geo.count == 2 else { continue }
//                let coordinate = CLLocationCoordinate2D(
//                    latitude: photo.geo[0],
//                    longitude: photo.geo[1]
//                )
//                
//                let point = snapshot.point(for: coordinate)
//                let markerSize = CGSize(width: 12, height: 12)
//                let markerRect = CGRect(
//                    x: point.x - markerSize.width/2,
//                    y: point.y - markerSize.height/2,
//                    width: markerSize.width,
//                    height: markerSize.height
//                )
//                
//                context.cgContext.setFillColor(UIColor.red.cgColor)
//                context.cgContext.fillEllipse(in: markerRect)
//            }
//        }
//    }
//}
//
//// MARK: - View
//
//struct MapWidgetEntryView: View {
//    var entry: MapWidgetProvider.Entry
//    
//    var body: some View {
//        Group {
//            if let image = entry.image {
//                Image(uiImage: image)
//                    .resizable()
//                    .scaledToFill()
//            } else {
//                Color.gray.opacity(0.3)
//            }
//        }
//        .frame(maxWidth: .infinity, maxHeight: .infinity)
//        .containerBackground(for: .widget) {
//            Color.clear
//        }
//    }
//}
//
//// MARK: - Widget
//
//struct MapWidget: Widget {
//    let kind: String = "HelloWidget"
//    
//    var body: some WidgetConfiguration {
//        StaticConfiguration(
//            kind: kind,
//            provider: MapWidgetProvider()
//        ) { entry in
//          MapWidgetEntryView(entry: entry)
//        }
//        .configurationDisplayName("Map Widget")
//        .description("Displays a large map snapshot with markers")
//        .supportedFamilies([.systemLarge])
//        .contentMarginsDisabled()
//    }
//}
//
//// MARK: - Preview
//
//struct MapWidget_Previews: PreviewProvider {
//    static var previews: some View {
//      MapWidgetEntryView(entry: MapWidgetEntry(date: Date(), image: nil))
//            .previewContext(WidgetPreviewContext(family: .systemLarge))
//    }
//}
