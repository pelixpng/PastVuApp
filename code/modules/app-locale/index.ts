import { requireNativeModule } from 'expo-modules-core'

type AppLocaleModule = {
  /**
   * Sets the app's language at the OS level, the same setting iOS and Android 13+ expose in their
   * own Settings for this app. Pass `null` to hand control back to the system language.
   *
   * Android applies it immediately; iOS stores the preference and needs a restart to pick it up,
   * which is how the system's own per-app language row behaves too.
   */
  setAppLocale(languageTag: string | null): void

  /**
   * The language the OS itself is set to, ignoring any per-app override this module applied.
   * `expo-localization` reports the app's own configuration instead, which still holds the
   * override right after switching back to "system" and would keep the old language on screen.
   */
  getSystemLocale(): string | null

  /**
   * Guesses the language of each text on the device itself; nothing leaves the device. Resolves,
   * per text and in the same order, the ISO 639-1 base code of its most likely language (`'ru'`,
   * `'en'`, `'zh'`), or `null` when the text is empty, the top guess is below 0.6 confidence, or
   * the OS offers no detection (Android before 10).
   *
   * `appLanguage` is the language the app runs in. iOS leans towards it on short texts that read as
   * either of two related languages, such as a Russian place name that could pass for Ukrainian.
   * Belarusian, Serbian Cyrillic, Estonian, Latvian and Lithuanian, which iOS has no model for, it
   * tells by their own letters. Android's classifier knows them all and takes no hint.
   *
   * Optional because a binary built before this method existed lacks it; callers treat a missing
   * method like an unknown language.
   */
  detectLanguages?(texts: string[], appLanguage: string): Promise<(string | null)[]>
}

export default requireNativeModule<AppLocaleModule>('AppLocale')
