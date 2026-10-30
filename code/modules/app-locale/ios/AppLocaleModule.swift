import ExpoModulesCore
import NaturalLanguage

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

    // On a queue of its own rather than Expo's shared one, which is serial: a colorization queued
    // ahead would hold the translate buttons back for as long as it runs. Each call has its own
    // recognizer, so calls may overlap.
    AsyncFunction("detectLanguages") { (texts: [String], appLanguage: String) -> [String?] in
      let detector = LanguageDetector(appLanguage: appLanguage)
      return texts.map { detector.language(of: $0) }
    }.runOnQueue(DispatchQueue.global(qos: .userInitiated))
  }
}

// MARK: - Language detection

/**
 Tells the language of a comment, title or description, for an app running in `appLanguage`.

 The recognizer on its own misreads the texts this app shows most. Russian place names and
 one-word comments come back as Kazakh, Bulgarian or Ukrainian with full confidence. Belarusian,
 Serbian Cyrillic, Estonian, Latvian and Lithuanian it has no model for, so it names whatever they
 resemble. Three things keep it in check: the languages that kept winning on Russian are ruled
 out, the app's language gets a mild head start, and letters only one language uses settle what
 the recognizer cannot.
 */
private final class LanguageDetector {
  private let appLanguage: String
  private let hints: [NLLanguage: Double]
  private let recognizer = NLLanguageRecognizer()

  init(appLanguage: String) {
    self.appLanguage = appLanguage
    // Latin-script Serbian reads as Croatian, which callers count as the same language.
    let hinted = appLanguage == "sr" ? NLLanguage.croatian : NLLanguage(rawValue: appLanguage)
    var hints = Dictionary(uniqueKeysWithValues: Self.candidates.map { ($0, 1.0) })
    if hints[hinted] != nil {
      hints[hinted] = Self.appLanguageWeight
    }
    let total = hints.values.reduce(0, +)
    self.hints = hints.mapValues { $0 / total }
  }

  /// The base code of the text's language, such as "zh" for zh-Hans, or nil when it cannot be told.
  func language(of text: String) -> String? {
    if text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
      return nil
    }
    // `reset()` also drops the constraints and hints, so they are set for every text.
    recognizer.reset()
    recognizer.languageConstraints = Self.candidates
    recognizer.languageHints = hints
    recognizer.processString(text)
    guard let top = recognizer.languageHypotheses(withMaximum: 1).first,
          top.key != .undetermined
    else {
      return nil
    }
    let guess = String(top.key.rawValue.prefix(while: { $0 != "-" }))
    let letters = text.lowercased()
    if Self.isWritten(letters, in: appLanguage, guess: guess) {
      return appLanguage
    }
    if let marked = Self.languageMarked(in: letters, guess: guess) {
      return marked
    }
    return top.value >= Self.minimumConfidence ? guess : nil
  }

  /// Below this the recognizer is guessing, typically on very short or mixed-language text, and
  /// offering a translation from a wrong language would be worse than offering none.
  private static let minimumConfidence = 0.6

  /**
   How much likelier the app's language is taken to be than any other before the text is read.
   Enough for "Кремль" or "Да" to stay Russian in a Russian app instead of turning Ukrainian, yet
   a Ukrainian sentence still reads as Ukrainian there.
   */
  private static let appLanguageWeight = 6.0

  /**
   Every language the recognizer knows except Kazakh, Bulgarian and Mongolian. PastVu has next to
   no text in those, and they are what Russian place names and short Russian comments were taken
   for.
   */
  private static let candidates: [NLLanguage] = [
    "am", "ar", "hy", "bn", "my", "ca", "chr", "hr", "cs", "da", "nl", "en", "fi", "fr", "ka", "de",
    "el", "gu", "he", "hi", "hu", "is", "id", "it", "ja", "kn", "km", "ko", "lo", "ms", "ml", "mr",
    "nb", "or", "fa", "pl", "pt", "pa", "ro", "ru", "zh-Hans", "si", "sk", "es", "sv", "ta", "te",
    "th", "bo", "zh-Hant", "tr", "uk", "ur", "vi",
  ].map { NLLanguage(rawValue: $0) }

  /**
   The language a text's own letters give away, where the recognizer misreads it: Belarusian,
   Serbian, the Baltic languages, and Russian in the old spelling. A rule applies only when the
   guess is in the same script as its letters, so a Russian description quoting a Latvian street
   name stays Russian.
   */
  private static func languageMarked(in letters: String, guess: String) -> String? {
    if guess == "ru" || guess == "uk" {
      // Belarusian alone has "ў". It also writes "і", which Russian lacks, next to "ы", "э" or
      // "ё", which Ukrainian lacks. Russian spelled the pre-1918 way, plentiful on PastVu, has "і"
      // too, but never without "и", "щ", "ъ" or "ѣ", none of which Belarusian has.
      let belarusianMix = letters.has(anyOf: "і") && letters.has(anyOf: "ыэё")
        && !letters.has(anyOf: "ищъѣ")
      if letters.has(anyOf: "ў") || belarusianMix {
        return "be"
      }
      if letters.has(anyOf: "ђјљњћџ") {
        return "sr"
      }
      // Ukrainian has none of these, so a "Ukrainian" text with them is Russian in the old
      // spelling, whose "і" swayed the recognizer.
      return guess == "uk" && letters.has(anyOf: "ыэъёѣ") ? "ru" : nil
    }
    if letters.has(anyOf: "ėįų") {
      return "lt"
    }
    // Macrons also mark Pinyin and romanized Japanese, which have "ō" or carons as well.
    if letters.has(anyOf: "ģķļņ") || (letters.has(anyOf: "āēī") && !letters.has(anyOf: "ōǎěǐǒǔ")) {
      return "lv"
    }
    if letters.has(anyOf: "õ") && guess != "pt" && guess != "vi" {
      return "et"
    }
    // Finnish has neither "ü" nor, outside loanwords, "š" and "ž"; Estonian has all three.
    return guess == "fi" && letters.has(anyOf: "üšž") ? "et" : nil
  }

  /**
   Letters of the app languages the recognizer has no model for, for short texts `languageMarked`
   cannot place. In an app running in one of them, a text written only in its letters, with at
   least one of those it is known by, is taken to be in it, so the app offers no translation of the
   user's own language. Latvian and Serbian need no entry: the letters `languageMarked` looks for
   are enough. Languages that write with the same letters and that the recognizer does know keep
   their guess, so Finnish stays Finnish in an Estonian app.
   */
  private static let ownLetters: [String: (alphabet: String, marks: String, keep: Set<String>)] = [
    "be": ("абвгдеёжзійклмнопрстуўфхцчшыьэюя", "іў", []),
    "et": ("abdefghijklmnoprsšzžtuvõäöü", "äöüõšž", ["fi", "de", "hu"]),
    "lt": ("aąbcčdeęėfghiįyjklmnoprsštuųūvzž", "ąčęėįšųūž", ["pl"]),
  ]

  private static func isWritten(_ letters: String, in language: String, guess: String) -> Bool {
    guard let own = ownLetters[language], !own.keep.contains(guess) else {
      return false
    }
    return letters.allSatisfy { !$0.isLetter || own.alphabet.contains($0) }
      && letters.has(anyOf: own.marks)
  }
}

private extension String {
  func has(anyOf characters: String) -> Bool {
    contains { characters.contains($0) }
  }
}
