import { I18n } from 'i18n-js'
import LocaleStore from '../store/Locale.store'
import { en } from './en'
import { ru } from './ru'
import { uk } from './uk'
import { be } from './be'
import { pl } from './pl'
import { de } from './de'
import { cs } from './cs'
import { hu } from './hu'
import { fi } from './fi'
import { et } from './et'
import { lv } from './lv'
import { lt } from './lt'
import { sr } from './sr'
import { fr } from './fr'

const i18n = new I18n({ en, ru, uk, be, pl, de, cs, hu, fi, et, lv, lt, sr, fr })
i18n.defaultLocale = 'en'
i18n.enableFallback = true

// i18n-js ships English plural rules only (one/other), which also fit de, hu, fi and et.
// The others need their own CLDR categories; each dictionary carries exactly the keys its
// rule can return.

// East and South Slavic: 1, 21, 31 → one; 2-4, 22-24 → few; the rest → other.
const slavicPlural = (count: number) => {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 1 && mod100 !== 11) return ['one']
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return ['few']
  return ['other']
}
for (const locale of ['ru', 'uk', 'be', 'sr']) {
  i18n.pluralization.register(locale, (_i18n, count) => slavicPlural(count))
}

// Polish: only exactly 1 is "one"; 22-24 are still "few".
i18n.pluralization.register('pl', (_i18n, count) => {
  const mod10 = count % 10
  const mod100 = count % 100
  if (count === 1) return ['one']
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return ['few']
  return ['other']
})

// Czech: 1 → one; 2-4 → few; the rest → other.
i18n.pluralization.register('cs', (_i18n, count) => {
  if (count === 1) return ['one']
  if (count >= 2 && count <= 4) return ['few']
  return ['other']
})

// Lithuanian: 1, 21, 31 → one; 2-9, 22-29 → few; 11-19 and round tens → other.
i18n.pluralization.register('lt', (_i18n, count) => {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod100 >= 11 && mod100 <= 19) return ['other']
  if (mod10 === 1) return ['one']
  if (mod10 >= 2 && mod10 <= 9) return ['few']
  return ['other']
})

// Latvian: 0, 10-20 and round tens → zero; 1, 21, 31 → one; the rest → other.
i18n.pluralization.register('lv', (_i18n, count) => {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 0 || (mod100 >= 11 && mod100 <= 19)) return ['zero']
  if (mod10 === 1) return ['one']
  return ['other']
})

// French: 0 and 1 are singular.
i18n.pluralization.register('fr', (_i18n, count) => (count <= 1 ? ['one'] : ['other']))

// A plural entry ({ one, other }) is a leaf too: callers pass its parent key plus a count.
type Leaves<T> = {
  [K in keyof T & string]: T[K] extends string
    ? K
    : T[K] extends { other: string }
      ? K
      : `${K}.${Leaves<T[K]>}`
}[keyof T & string]

export type TranslationKey = Leaves<Omit<typeof en, 'date'>>

/**
 * Reading `LocaleStore.locale` here is what ties translations to MobX: every `observer` component
 * that renders a translated string re-renders on a language switch, and every `computed` that
 * builds one is invalidated. No provider, no context, and it works the same in view models and
 * services, where roughly half of this app's strings live.
 */
export const t = (key: TranslationKey, options?: Record<string, unknown>): string => {
  i18n.locale = LocaleStore.locale
  return i18n.t(key, options)
}

/** Month names in the current language, for the hand-rolled date formatter. */
export const months = (): string[] => {
  i18n.locale = LocaleStore.locale
  return i18n.t('date.months') as unknown as string[]
}

const LOCALE_TAGS: Record<string, string> = {
  ru: 'ru-RU',
  en: 'en-US',
  uk: 'uk-UA',
  be: 'be-BY',
  pl: 'pl-PL',
  de: 'de-DE',
  cs: 'cs-CZ',
  hu: 'hu-HU',
  fi: 'fi-FI',
  et: 'et-EE',
  lv: 'lv-LV',
  lt: 'lt-LT',
  sr: 'sr-Cyrl-RS',
  fr: 'fr-FR',
}

/** BCP 47 tag for `Intl` and `toLocaleString`. */
export const localeTag = (): string => LOCALE_TAGS[LocaleStore.locale] ?? 'en-US'

/** Release date of the current build, spelled out in the active language. */
export const formatLongDate = (date: Date): string =>
  new Intl.DateTimeFormat(localeTag(), { day: 'numeric', month: 'long', year: 'numeric' }).format(
    date,
  )
