import SwiftUI

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
      PhotoNearbyView()
    }
}

struct PhotoNearbyView: View {
    @StateObject private var viewModel = PhotoNearbyViewModel()
    
    var body: some View {
      NavigationStack{
        VStack {
          if viewModel.isLoading {
            ProgressView("Загрузка...")
              .padding()
          } else if let error = viewModel.error {
            Text("Ошибка: \(error)")
              .foregroundColor(.red)
              .padding()
          } else if viewModel.photos.isEmpty {
            Text("Нет фотографий")
              .padding()
          } else {
            List(viewModel.photos) { photo in
              HStack {
                Spacer(minLength: 0)
                ZStack(alignment: .bottomLeading) {
                  if let url = photo.imageURL {
                    URLImage(url: url) {
                      ProgressView()
                    }
                    .aspectRatio(contentMode: .fill)
                    .frame(width: 160, height: 120)
                    .clipped()
                  } else {
                    Color.gray
                      .frame(width: 160, height: 120)
                  }
                  LinearGradient(
                    gradient: Gradient(colors: [Color.clear, Color.black.opacity(0.6)]),
                    startPoint: .center,
                    endPoint: .bottom
                  )
                  .frame(height: 40)
                  VStack(alignment: .leading) {
                    Text(photo.title)
                      .font(.headline)
                      .foregroundColor(.white)
                      .lineLimit(1)
                  }
                  .padding([.leading, .bottom], 8)
                }
                .frame(width: 160, height: 120)
                .clipShape(RoundedRectangle(cornerRadius: 20))
                Spacer(minLength: 0)
              }
              .listRowInsets(EdgeInsets())
            }
            .listStyle(CarouselListStyle())
          }
        }
        .onAppear {
          viewModel.requestLocation()
        }.navigationTitle("Фото рядом")
      }
    }
}
