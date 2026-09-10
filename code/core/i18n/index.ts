import { I18n } from 'i18n-js'
import LocaleStore from '../store/Locale.store'
import { en } from './en'
import { ru } from './ru'

const i18n = new I18n({ en, ru })
i18n.defaultLocale = 'en'
i18n.enableFallback = true

// i18n-js ships English plural rules only; Russian needs one/few/many.
i18n.pluralization.register('ru', (_i18n, count) => {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 1 && mod100 !== 11) return ['one']
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return ['few']
  return ['other']
})

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

/** BCP 47 tag for `Intl` and `toLocaleString`. */
export const localeTag = (): string => (LocaleStore.locale === 'ru' ? 'ru-RU' : 'en-US')

/** Release date of the current build, spelled out in the active language. */
export const formatLongDate = (date: Date): string =>
  new Intl.DateTimeFormat(localeTag(), { day: 'numeric', month: 'long', year: 'numeric' }).format(
    date,
  )
