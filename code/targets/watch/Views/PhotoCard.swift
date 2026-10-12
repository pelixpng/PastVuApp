import SwiftUI

/// One photo across the full width of the screen, with its title over the bottom edge.
///
/// Every card is 4:3, the shape of most PastVu photos, and the photo fills it. A fixed shape keeps
/// the list from jumping as photos arrive while the crown is turning.
struct PhotoCard: View {
    let photo: Photo
    @StateObject private var loader: ImageLoader

    init(photo: Photo) {
        self.photo = photo
        _loader = StateObject(wrappedValue: ImageLoader(url: photo.imageURL))
    }

    var body: some View {
        Color(white: 0.15)
            .aspectRatio(4.0 / 3.0, contentMode: .fit)
            .frame(maxWidth: .infinity)
            .overlay { picture }
            .overlay(alignment: .bottom) {
                LinearGradient(
                    colors: [.clear, .black.opacity(0.75)],
                    startPoint: .top,
                    endPoint: .bottom
                )
                .frame(height: 60)
            }
            .overlay(alignment: .bottomLeading) {
                Text(photo.title)
                    .font(.headline)
                    .foregroundColor(.white)
                    .lineLimit(2)
                    .padding(.horizontal, 10)
                    .padding(.bottom, 8)
            }
            .clipShape(RoundedRectangle(cornerRadius: 12))
    }

    @ViewBuilder
    private var picture: some View {
        switch loader.state {
        case .loading:
            ProgressView()
        case .loaded(let image):
            Image(uiImage: image)
                .resizable()
                .scaledToFill()
        case .failed:
            Image(systemName: "photo")
                .font(.title2)
                .foregroundColor(.gray)
        }
    }
}
