import { OptionsRadioButton } from '../components/ui/buttons/radioButton/RadioButtons'

const showClusterOptions: OptionsRadioButton[] = [
  { label: 'Да', value: 'yes' },
  { label: 'Нет', value: 'no' },
]
const themeOptions: OptionsRadioButton[] = [
  { label: 'Тёмная', value: 'dark' },
  { label: 'Светлая', value: 'light' },
  { label: 'Системная', value: 'system' },
]
const photoQualityOptions: OptionsRadioButton[] = [
  { label: 'Оригинал', value: 'a' },
  { label: 'Стандарт', value: 'd' },
  { label: 'Миниатюра', value: 'h' },
]
const mapTypeOptions: OptionsRadioButton[] = [
  { label: 'Стандарт', value: 'standard' },
  { label: 'Спутник', value: 'satellite' },
  { label: 'Гибрид', value: 'hybrid' },
  { label: 'Рельеф', value: 'terrain' },
]
const markerTypeOptions: OptionsRadioButton[] = [
  { label: 'Новый', value: 'new' },
  { label: 'Старый', value: 'old' },
]

export const SettingsOptions = {
  showClusterOptions,
  themeOptions,
  photoQualityOptions,
  mapTypeOptions,
  markerTypeOptions,
}
