import ExpoModulesCore

/// Hands API keys to JavaScript from Info.plist.
///
/// Info.plist only holds `$(NAME)` references; Xcode resolves them at build time from
/// `ios/Keys.xcconfig`, which the Podfile generates from the project's `.env` and git ignores.
/// See `plugins/withApiKeys.js`.
public class AppKeysModule: Module {
  public func definition() -> ModuleDefinition {
    Name("AppKeys")

    Function("get") { (name: String) -> String in
      let value = Bundle.main.object(forInfoDictionaryKey: name) as? String ?? ""
      // An unresolved reference means the xcconfig was missing at build time.
      return value.hasPrefix("$(") ? "" : value
    }
  }
}
