import SwiftUI
import CoreLocation

/// Why the photos around the user could not be shown.
enum NearbyProblem: Error, Equatable {
    /// The user has not let the app use their location, or a profile forbids it.
    case locationDenied
    /// Location is allowed, but the watch could not find where it is.
    case locationUnavailable
    /// No connection: neither through the iPhone nor over Wi-Fi or cellular.
    case offline
    /// PastVu answered with an error or with something that is not a list of photos.
    case server
}

/// Finds where the user is and loads the PastVu photos taken around them.
final class PhotoNearbyViewModel: NSObject, ObservableObject, CLLocationManagerDelegate {
    @Published private(set) var photos: [Photo] = []
    @Published private(set) var isLoading = false
    /// Why the last attempt failed. Photos from an earlier attempt stay on screen alongside it.
    @Published private(set) var problem: NearbyProblem?
    /// Set once an attempt has finished, so an empty list reads as "nothing nearby".
    @Published private(set) var hasLoaded = false

    private let locationManager = CLLocationManager()
    /// Waiting for the user to answer the location permission prompt.
    private var awaitingAuthorization = false

    override init() {
        super.init()
        locationManager.delegate = self
        locationManager.desiredAccuracy = kCLLocationAccuracyHundredMeters
    }

    /// Finds the user and loads the photos around them. Also what the refresh button calls.
    func refresh() {
        guard !isLoading else { return }
        switch locationManager.authorizationStatus {
        case .notDetermined:
            isLoading = true
            awaitingAuthorization = true
            locationManager.requestWhenInUseAuthorization()
        case .denied, .restricted:
            finish(with: .locationDenied)
        default:
            isLoading = true
            locationManager.requestLocation()
        }
    }

    func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        switch manager.authorizationStatus {
        case .authorizedAlways, .authorizedWhenInUse:
            // Either the prompt was just answered, or access was granted in Settings while the
            // screen said it was missing: carry on without making the user press retry.
            if awaitingAuthorization {
                awaitingAuthorization = false
                manager.requestLocation()
            } else if problem == .locationDenied && photos.isEmpty {
                refresh()
            }
        case .denied, .restricted:
            if awaitingAuthorization || isLoading {
                awaitingAuthorization = false
                finish(with: .locationDenied)
            }
        default:
            break
        }
    }

    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let location = locations.last else { return }
        fetchPhotos(near: location.coordinate)
    }

    func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        let denied = (error as? CLError)?.code == .denied
        finish(with: denied ? .locationDenied : .locationUnavailable)
    }

    private func fetchPhotos(near coordinate: CLLocationCoordinate2D) {
        let params: [String: Any] = [
            "geo": [coordinate.latitude, coordinate.longitude],
            "limit": 30,
        ]
        guard let json = try? JSONSerialization.data(withJSONObject: params),
              let jsonString = String(data: json, encoding: .utf8),
              let encoded = jsonString.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed),
              let url = URL(string: "https://api.pastvu.com/api2?method=photo.giveNearestPhotos&params=\(encoded)")
        else {
            finish(with: .server)
            return
        }

        var request = URLRequest(url: url)
        request.timeoutInterval = 20
        URLSession.shared.dataTask(with: request) { [weak self] data, response, error in
            let result: Result<[Photo], NearbyProblem>
            if let error = error as? URLError {
                result = .failure(Self.isConnectionProblem(error) ? .offline : .server)
            } else if error != nil {
                result = .failure(.server)
            } else if let status = (response as? HTTPURLResponse)?.statusCode, status != 200 {
                result = .failure(.server)
            } else if let data, let decoded = try? JSONDecoder().decode(APIResponse.self, from: data) {
                // PastVu reports its own errors with HTTP 200 and no `result`, which fails to decode.
                result = .success(decoded.result.photos)
            } else {
                result = .failure(.server)
            }
            DispatchQueue.main.async {
                switch result {
                case .success(let photos):
                    self?.photos = photos
                    self?.finish(with: nil)
                case .failure(let problem):
                    self?.finish(with: problem)
                }
            }
        }.resume()
    }

    private func finish(with problem: NearbyProblem?) {
        self.problem = problem
        isLoading = false
        hasLoaded = true
    }

    /// Errors that mean the watch cannot reach the internet, as opposed to PastVu failing.
    private static func isConnectionProblem(_ error: URLError) -> Bool {
        switch error.code {
        case .notConnectedToInternet, .networkConnectionLost, .timedOut, .cannotFindHost,
             .cannotConnectToHost, .dnsLookupFailed, .dataNotAllowed, .internationalRoamingOff,
             .secureConnectionFailed:
            return true
        default:
            return false
        }
    }
}
