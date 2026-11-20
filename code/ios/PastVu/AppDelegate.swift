internal import Expo
import React
import ReactAppDependencyProvider

/// Shows wherever React has not drawn yet, e.g. for a moment while the screen rotates.
/// RN's default, systemBackground, is pure black in dark mode: use the app's dark grey instead
/// (backgroundApp in core/components/theme/Theme.ts). Light mode stays white.
/// SceneDelegate puts it on the window, ReactNativeDelegate on the root view.
let appBackgroundColor = UIColor { traits in
  traits.userInterfaceStyle == .dark
    ? UIColor(red: 0x1C / 255.0, green: 0x1C / 255.0, blue: 0x1E / 255.0, alpha: 1)
    : .white
}

@main
class AppDelegate: ExpoAppDelegate, ExpoReactNativeFactoryProvider {
  var window: UIWindow?

  var reactNativeDelegate: ExpoReactNativeFactoryDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  public override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    let delegate = ReactNativeDelegate()
    let factory = ExpoReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    // The window is created and React Native is started by `SceneDelegate` under the
    // scene-based life cycle (required by the iOS 27 SDK).
    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }
}

class ReactNativeDelegate: ExpoReactNativeFactoryDelegate {
  // Extension point for config-plugins

  override func customize(_ rootView: UIView) {
    // Super hands the root view to Expo's subscribers, which put the splash screen on it.
    super.customize(rootView)
    rootView.backgroundColor = appBackgroundColor
  }

  override func sourceURL(for bridge: RCTBridge) -> URL? {
    // needed to return the correct URL for expo-dev-client.
    bridge.bundleURL ?? bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    return RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: ".expo/.virtual-metro-entry")
#else
    return Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
