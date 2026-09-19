import AVFoundation
import ExpoModulesCore

/**
 * The back lenses with the zoom factor the system camera prints for each ("0.5", "1", "5").
 *
 * expo-camera only knows lenses by localized name, and nothing in its API says how strong they
 * are. AVFoundation does: a virtual device (triple / dual-wide / dual) lists its physical
 * constituents and the zoom factors at which it switches between them, so dividing those by the
 * wide lens's own factor gives the familiar labels. Names are the same `localizedName` values
 * expo-camera uses, so the result can be passed straight into `selectedLens`.
 */
public class CameraLensesModule: Module {
  public func definition() -> ModuleDefinition {
    Name("CameraLenses")

    Function("getBackLenses") { () -> [[String: Any]] in
      let virtualTypes: [AVCaptureDevice.DeviceType] = [
        .builtInTripleCamera, .builtInDualWideCamera, .builtInDualCamera,
      ]
      let virtual = virtualTypes.lazy
        .compactMap { AVCaptureDevice.default($0, for: .video, position: .back) }
        .first

      // Crop factors at which the sensor still delivers native resolution (2x on 48 MP wides);
      // the system camera shows them as extra lens buttons. iOS 16+.
      func describe(_ lens: AVCaptureDevice, factor: Double) -> [String: Any] {
        var crops: [Double] = []
        if #available(iOS 16.0, *) {
          let factors: [CGFloat] = lens.formats.flatMap { $0.secondaryNativeResolutionZoomFactors }
          crops = Array(Set(factors.map { Double($0) }))
        }
        return [
          "name": lens.localizedName,
          "factor": factor,
          "maxZoom": lens.activeFormat.videoMaxZoomFactor,
          "cropFactors": crops,
        ]
      }

      guard let device = virtual else {
        // Single-lens phone: just the wide camera.
        if let wide = AVCaptureDevice.default(.builtInWideAngleCamera, for: .video, position: .back) {
          return [describe(wide, factor: 1.0)]
        }
        return []
      }

      let lenses = device.constituentDevices
      // Switch-over factors sit between consecutive lenses, so the first lens starts at 1.
      let starts = [1.0] + device.virtualDeviceSwitchOverVideoZoomFactors.map { $0.doubleValue }
      let wideIndex = lenses.firstIndex { $0.deviceType == .builtInWideAngleCamera } ?? 0
      let wideStart = wideIndex < starts.count ? starts[wideIndex] : 1.0

      return lenses.enumerated().map { index, lens in
        let start = index < starts.count ? starts[index] : 1.0
        return describe(lens, factor: start / wideStart)
      }
    }
  }
}
