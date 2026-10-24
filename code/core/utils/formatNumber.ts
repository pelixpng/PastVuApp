import { localeTag, t } from '../i18n'

/** A number grouped the way the current language writes it: 28 407, 28,407. */
export const formatNumber = (value: number, options?: Intl.NumberFormatOptions): string => {
  try {
    return new Intl.NumberFormat(localeTag(), options).format(value)
  } catch {
    return options?.maximumFractionDigits === undefined
      ? String(value)
      : value.toFixed(options.maximumFractionDigits)
  }
}

/**
 * A distance for a list: metres under a kilometre (in tens from 100 m), then kilometres with one
 * decimal, written with the language's own separator: 350 m, 1.2 km, 1,2 km.
 */
export const formatDistance = (meters: number): string => {
  const rounded = meters < 100 ? Math.round(meters) : Math.round(meters / 10) * 10
  if (rounded < 1000) return t('map.distanceM', { distance: formatNumber(rounded) })
  return t('map.distanceKm', {
    distance: formatNumber(meters / 1000, { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
  })
}
