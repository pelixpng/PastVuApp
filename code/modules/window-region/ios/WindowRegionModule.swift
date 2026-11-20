import ExpoModulesCore
import UIKit

/**
 * From iPadOS 26 a window that is not full screen carries its controls (close, minimise, arrange)
 * over its top-left corner, below the status bar. The safe area leaves them out: UIKit's own bars
 * make room for them by themselves, React Navigation's headers are plain views and do not.
 */
public class WindowRegionModule: Module {
  public func definition() -> ModuleDefinition {
    Name("WindowRegion")

    View(WindowControlsView.self) {
      Events("onControlsChange")
    }

    View(ReservedRegionsView.self) {
      Events("onOcclusionChange")
    }
  }
}

/**
 * Reports, through `onControlsChange`, how far below the top of the safe area the window controls
 * reach: 0 full screen, on an iPhone and before iOS 26. Measured against the view's own frame, so
 * lay it over the whole root view.
 */
final class WindowControlsView: ExpoView {
  let onControlsChange = EventDispatcher()
  private var reported: CGFloat?

  override func layoutSubviews() {
    super.layoutSubviews()
    report()
  }

  override func safeAreaInsetsDidChange() {
    super.safeAreaInsetsDidChange()
    report()
  }

  private func report() {
    guard window != nil else { return }
    var top: CGFloat = 0
    if #available(iOS 26.0, *) {
      // The safe area with its top moved down past the controls, wherever they overlap it.
      let clear = edgeInsets(for: .safeArea(cornerAdaptation: .vertical))
      top = max(0, clear.top - safeAreaInsets.top)
    }
    guard top != reported else { return }
    reported = top
    onControlsChange(["top": top])
  }
}

/**
 * Reports, through `onOcclusionChange`, the parts of the view the hardware covers, in its own
 * coordinates: the camera and the Dynamic Island, with the margins interactive content keeps from
 * them. iOS 27.1 and later; none before. On iPhone Duo's cover display the camera sits in the
 * top-right corner, beside the top of the screen rather than above it, where the top safe-area
 * inset is 0: the phone's search field stands level with it instead of under it.
 */
final class ReservedRegionsView: ExpoView {
  let onOcclusionChange = EventDispatcher()
  private var reported: [CGRect]?

  override func didMoveToWindow() {
    super.didMoveToWindow()
    setNeedsUpdateConstraints()
  }

  // UIKit tracks the regions read here and runs it again when they change.
  override func updateConstraints() {
    report()
    super.updateConstraints()
  }

  override func layoutSubviews() {
    super.layoutSubviews()
    report()
  }

  private func report() {
    guard window != nil else { return }
    var frames: [CGRect] = []
    if #available(iOS 27.1, *) {
      frames = reservedRegions(kind: .occlusion).map(\.frame)
    }
    guard frames != reported else { return }
    reported = frames
    onOcclusionChange([
      "regions": frames.map {
        ["x": $0.minX, "y": $0.minY, "width": $0.width, "height": $0.height]
      }
    ])
  }
}
