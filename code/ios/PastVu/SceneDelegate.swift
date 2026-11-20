internal import Expo
import UIKit

@objc(SceneDelegate)
class SceneDelegate: ExpoAppSceneDelegate {
  // Extension point for config plugins.

  override func scene(
    _ scene: UIScene,
    willConnectTo session: UISceneSession,
    options connectionOptions: UIScene.ConnectionOptions
  ) {
    // Super creates the window from the scene and starts React Native in it.
    super.scene(scene, willConnectTo: session, options: connectionOptions)
    window?.backgroundColor = appBackgroundColor
    // From iPadOS 27 UIRequiresFullScreen no longer keeps the window full screen, and the user can
    // narrow it to about an iPhone's width, where the tablet's column and panel do not fit. The
    // system may lower a preference it finds too large, so the layout must not count on it.
    if UIDevice.current.userInterfaceIdiom == .pad, let windowScene = scene as? UIWindowScene {
      windowScene.sizeRestrictions?.minimumSize = Self.minimumTabletWindow
    }
  }

  /**
   * The narrowest window with room for the tablet's 320 pt column and its 364 pt panel side by side,
   * with their 16 pt margins (see tablet/hooks/useTabletLayout). Below it the column narrows, and its
   * rows, cards and tab labels break words apart; the iPad mini is 744 pt wide in portrait.
   */
  private static let minimumTabletWindow = CGSize(width: 716, height: 600)
}
