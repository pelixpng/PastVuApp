import { localeTag, months } from '../i18n'
export const formatDate = (inputDate?: string | number) => {
  if (!inputDate) return undefined
  const monthNames = months()
  const date = new Date(inputDate)
  const formatNumber = (n: number) => n.toString().padStart(2, '0')
  return typeof inputDate === 'string'
    ? `${date.getUTCDate()} ${monthNames[date.getUTCMonth()]} ${date.getUTCFullYear()}, ${formatNumber(
        date.getUTCHours(),
      )}:${formatNumber(date.getUTCMinutes())}`
    : date.toLocaleString(localeTag(), {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
}
