import SwiftUI
import CoreLocation

class PhotoNearbyViewModel: NSObject, ObservableObject, CLLocationManagerDelegate {
    @Published var photos: [Photo] = []
    @Published var isLoading: Bool = false
    @Published var error: String? = nil
    
    private var locationManager: CLLocationManager?
    
    override init() {
        super.init()
        locationManager = CLLocationManager()
        locationManager?.delegate = self
        locationManager?.desiredAccuracy = kCLLocationAccuracyKilometer
    }
    
    func requestLocation() {
        locationManager?.requestWhenInUseAuthorization()
    }
    
    func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        switch manager.authorizationStatus {
        case .authorizedAlways, .authorizedWhenInUse:
            manager.requestLocation()
        case .denied, .restricted:
            DispatchQueue.main.async {
                self.error = "Доступ к геолокации запрещён."
            }
        default:
            break
        }
    }
    
    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let location = locations.last else { return }
        fetchPhotos(latitude: location.coordinate.latitude, longitude: location.coordinate.longitude)
    }
    
    func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        DispatchQueue.main.async {
            self.error = error.localizedDescription
        }
    }
    
    func fetchPhotos(latitude: Double, longitude: Double) {
        DispatchQueue.main.async {
            self.isLoading = true
        }
        
        let paramsDict: [String: Any] = [
            "geo": [latitude, longitude],
            "limit": 30,
        ]
        
        guard let jsonData = try? JSONSerialization.data(withJSONObject: paramsDict),
              let jsonString = String(data: jsonData, encoding: .utf8),
              let encodedParams = jsonString.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed)
        else {
            DispatchQueue.main.async {
                self.error = "Ошибка кодирования параметров"
                self.isLoading = false
            }
            return
        }
        
        let urlString = "https://api.pastvu.com/api2?method=photo.giveNearestPhotos&params=\(encodedParams)"
        
        guard let url = URL(string: urlString) else {
            DispatchQueue.main.async {
                self.error = "Неверный URL"
                self.isLoading = false
            }
            return
        }
        
        URLSession.shared.dataTask(with: url) { data, response, err in
            DispatchQueue.main.async {
                self.isLoading = false
            }
            if let err = err {
                DispatchQueue.main.async {
                    self.error = err.localizedDescription
                }
                return
            }
            guard let data = data else {
                DispatchQueue.main.async {
                    self.error = "Нет данных"
                }
                return
            }
            do {
                let decoder = JSONDecoder()
                let response = try decoder.decode(APIResponse.self, from: data)
                DispatchQueue.main.async {
                    self.photos = response.result.photos
                }
            } catch {
                DispatchQueue.main.async {
                    self.error = error.localizedDescription
                }
            }
        }.resume()
    }
}
