import { localeTag } from '../i18n'

/** A number grouped the way the current language writes it: 28 407, 28,407. */
export const formatNumber = (value: number): string => {
  try {
    return new Intl.NumberFormat(localeTag()).format(value)
  } catch {
    return String(value)
  }
}
