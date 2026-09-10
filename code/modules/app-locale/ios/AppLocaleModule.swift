import ExpoModulesCore

public class AppLocaleModule: Module {
  public func definition() -> ModuleDefinition {
    Name("AppLocale")

    // `AppleLanguages` is the same user-defaults key iOS writes when a language is picked from the
    // app's own row in Settings, so setting it here keeps a single source of truth. It is read at
    // launch: the change lands on the next start, exactly as it does from Settings.
    // iOS needs no special handling: `AppleLanguages` lives in user defaults and
    // `Locale.preferredLanguages` reads it live, so clearing the override is reflected at once --
    // and the per-app Language row in Settings stays authoritative. Returning nil lets the caller
    // fall back to the standard lookup.
    Function("getSystemLocale") { () -> String? in
      return nil
    }

    Function("setAppLocale") { (languageTag: String?) in
      let defaults = UserDefaults.standard
      if let tag = languageTag {
        defaults.set([tag], forKey: "AppleLanguages")
      } else {
        defaults.removeObject(forKey: "AppleLanguages")
      }
      defaults.synchronize()
    }
  }
}
