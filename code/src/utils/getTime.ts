export const formatDate = (inputDate?: string | number) => {
  if (!inputDate) return undefined
  const months = [
    'Января',
    'Февраля',
    'Марта',
    'Апреля',
    'Мая',
    'Июня',
    'Июля',
    'Августа',
    'Сентября',
    'Октября',
    'Ноября',
    'Декабря',
  ]
  const date = new Date(inputDate)
  const formatNumber = (n: number) => n.toString().padStart(2, '0')
  return typeof inputDate === 'string'
    ? `${date.getUTCDate()} ${months[date.getUTCMonth()]} ${date.getUTCFullYear()}, ${formatNumber(
        date.getUTCHours(),
      )}:${formatNumber(date.getUTCMinutes())}`
    : date.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
}
