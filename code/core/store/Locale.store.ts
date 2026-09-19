import { action, computed, makeObservable, observable } from 'mobx'
import { getLocales } from 'expo-localization'
import { MMKVStorage } from '../storage/mmkv'
import AppLocaleModule from '../../modules/app-locale'

export const SUPPORTED_LOCALES = [
  'ru',
  'en',
  'uk',
  'be',
  'pl',
  'de',
  'cs',
  'hu',
  'fi',
  'et',
  'lv',
  'lt',
  'sr',
  'fr',
] as const
export type AppLocale = (typeof SUPPORTED_LOCALES)[number]

/** `system` follows the device, or the per-app language iOS offers in its Settings. */
export const LOCALE_PREFERENCES = ['system', ...SUPPORTED_LOCALES] as const
export type LocalePreference = (typeof LOCALE_PREFERENCES)[number]

const isPreference = (value?: string | null): value is LocalePreference =>
  LOCALE_PREFERENCES.includes(value as LocalePreference)

const toSupported = (code?: string | null): AppLocale =>
  SUPPORTED_LOCALES.includes(code as AppLocale) ? (code as AppLocale) : 'en'

/**
 * The language of the device itself, ignoring any per-app override.
 *
 * Asked of the OS directly: `expo-localization` reports the app's own configuration, which right
 * after switching back to "system" still carries the override this app applied, so the interface
 * would stay in the language the user just moved away from.
 */
const systemLocale = (): AppLocale =>
  toSupported(AppLocaleModule.getSystemLocale() ?? getLocales()[0]?.languageCode)

/**
 * The language the app is currently running in, override included. This is what the per-app
 * Language row in the OS settings changes, so it is the value to compare a stored choice against.
 */
const appliedLocale = (): AppLocale => toSupported(getLocales()[0]?.languageCode)

const storedPreference = (): LocalePreference => {
  const stored = MMKVStorage.get('locale')
  if (!isPreference(stored)) return 'system'
  // An explicit choice writes the OS-level language too, so the two normally agree. When they
  // disagree the language was last changed from the system side -- iOS restarts the app for that,
  // so this runs right after -- and the newer choice wins. Without this the stored preference
  // would keep overriding the interface while the map and the permission dialogs, which read the
  // OS locale directly, had already switched.
  if (stored !== 'system' && stored !== appliedLocale()) return 'system'
  return stored
}

class LocaleStore {
  @observable preference: LocalePreference = storedPreference()

  constructor() {
    makeObservable(this)
    // Persist the reconciled value so the next launch starts from an agreed state.
    MMKVStorage.set('locale', this.preference)
  }

  /**
   * The language actually used for translations.
   *
   * Defaulting to `system` keeps iOS's per-app language setting meaningful: the app ships ru/en
   * localizations, so iOS lists PastVu under Settings with its own Language row, and picking a
   * language there restarts the app. Storing an explicit choice instead would silently win over
   * that row forever.
   */
  @computed
  get locale(): AppLocale {
    return this.preference === 'system' ? systemLocale() : this.preference
  }

  @action.bound
  setLocale(value: string) {
    if (!isPreference(value)) return
    // The OS side goes first: changing `preference` re-evaluates `locale` synchronously, and that
    // reads the applied locale back from the platform. Setting it afterwards would have the
    // interface pick up the language that is on its way out.
    AppLocaleModule.setAppLocale(value === 'system' ? null : value)
    this.preference = value
    MMKVStorage.set('locale', value)
  }
}

export default new LocaleStore()
