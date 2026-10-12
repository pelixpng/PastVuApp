import SwiftUI

struct PhotoNearbyView_Previews: PreviewProvider {
    static var previews: some View {
        PhotoNearbyView()
    }
}

struct PhotoNearbyView: View {
    @StateObject private var viewModel = PhotoNearbyViewModel()

    var body: some View {
        NavigationStack {
            // One heading row, title on the left and refresh on the right, under the clock in the
            // top-right corner. Toolbar buttons would move the clock to the centre and push the
            // title onto a line of its own, three elements on three different lines.
            ScrollView {
                LazyVStack(alignment: .leading, spacing: 8) {
                    Header(
                        isRefreshing: viewModel.isLoading && !viewModel.photos.isEmpty,
                        isLoading: viewModel.isLoading,
                        refresh: viewModel.refresh
                    )
                    content
                }
                // A little room at the sides, so the cards do not touch the rounded screen edges.
                .padding(.horizontal, 6)
            }
        }
        .onAppear { viewModel.refresh() }
    }

    @ViewBuilder
    private var content: some View {
        if !viewModel.photos.isEmpty {
            // A refresh that failed leaves the earlier photos in place and says why above them.
            if let problem = viewModel.problem {
                ProblemBanner(problem: problem)
            }
            ForEach(viewModel.photos) { photo in
                PhotoCard(photo: photo)
            }
        } else if viewModel.isLoading || !viewModel.hasLoaded {
            ProgressView()
                .frame(maxWidth: .infinity)
                .padding(.top, 24)
        } else if let problem = viewModel.problem {
            StatusView(
                icon: problem.icon,
                title: problem.title,
                message: problem.message,
                retry: viewModel.refresh
            )
        } else {
            StatusView(
                icon: "photo.on.rectangle",
                title: "Рядом нет фотографий",
                message: "PastVu не нашёл снимков поблизости.",
                retry: viewModel.refresh
            )
        }
    }
}

/// The title with the refresh button beside it; a spinner takes the button's place while photos
/// already on screen are being refreshed.
private struct Header: View {
    let isRefreshing: Bool
    let isLoading: Bool
    let refresh: () -> Void

    private let buttonSize: CGFloat = 34

    var body: some View {
        HStack(spacing: 4) {
            Text("Фото рядом")
                .font(.title3.weight(.semibold))
                .lineLimit(1)
                .minimumScaleFactor(0.8)
            Spacer(minLength: 0)
            if isRefreshing {
                ProgressView()
                    .frame(width: buttonSize, height: buttonSize)
            } else {
                Button(action: refresh) {
                    Image(systemName: "arrow.clockwise")
                        .font(.system(size: 15, weight: .semibold))
                        .frame(width: buttonSize, height: buttonSize)
                        .background(Circle().fill(Color.white.opacity(0.15)))
                }
                .buttonStyle(.plain)
                .disabled(isLoading)
                .accessibilityLabel("Обновить")
            }
        }
    }
}

/// A whole-screen explanation with a way to try again.
private struct StatusView: View {
    let icon: String
    let title: String
    let message: String
    let retry: () -> Void

    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundColor(.gray)
            Text(title)
                .font(.headline)
                .multilineTextAlignment(.center)
            Text(message)
                .font(.footnote)
                .foregroundColor(.gray)
                .multilineTextAlignment(.center)
            Button("Повторить", action: retry)
                .padding(.top, 4)
        }
        .frame(maxWidth: .infinity)
        .padding(.top, 8)
    }
}

/// A one-line note above photos that could not be refreshed.
private struct ProblemBanner: View {
    let problem: NearbyProblem

    var body: some View {
        Label(problem.shortTitle, systemImage: problem.icon)
            .font(.footnote)
            .foregroundColor(.orange)
            .frame(maxWidth: .infinity, alignment: .leading)
    }
}

private extension NearbyProblem {
    var icon: String {
        switch self {
        case .locationDenied: return "location.slash"
        case .locationUnavailable: return "location"
        case .offline: return "wifi.slash"
        case .server: return "exclamationmark.triangle"
        }
    }

    var title: String {
        switch self {
        case .locationDenied: return "Нет доступа к геопозиции"
        case .locationUnavailable: return "Не удалось определить место"
        case .offline: return "Нет интернета"
        case .server: return "Не удалось загрузить фото"
        }
    }

    var message: String {
        switch self {
        case .locationDenied:
            return "Разрешите доступ на часах: Настройки → Конфиденциальность и безопасность → Службы геолокации → PastVu."
        case .locationUnavailable:
            return "Проверьте, что службы геолокации включены, и попробуйте ещё раз."
        case .offline:
            return "Часам нужен интернет: через iPhone, Wi-Fi или сотовую сеть."
        case .server:
            return "Сервер PastVu не ответил. Попробуйте чуть позже."
        }
    }

    /// For the banner over photos that are already shown.
    var shortTitle: String {
        switch self {
        case .locationDenied: return "Нет доступа к геопозиции"
        case .locationUnavailable: return "Место не определено"
        case .offline: return "Нет интернета"
        case .server: return "Не удалось обновить"
        }
    }
}
