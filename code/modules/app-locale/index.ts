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
}

export default requireNativeModule<AppLocaleModule>('AppLocale')
