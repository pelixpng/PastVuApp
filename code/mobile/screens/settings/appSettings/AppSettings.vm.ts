import { makeObservable } from 'mobx'
import { SCREENS } from '../../../navigation/navigation.types'
import { OptionsRadioButton } from '../../../../core/components/ui/buttons/radioButton/RadioButtons'
import { BaseViewModelProvider } from '../../../provider/vm.provider'

class AppSettingsVM extends BaseViewModelProvider<SCREENS.APP_SETTINGS> {
  showClusterOptions: OptionsRadioButton[] = [
    { label: 'Да', value: 'yes' },
    { label: 'Нет', value: 'no' },
  ]
  themeOptions: OptionsRadioButton[] = [
    { label: 'Тёмная', value: 'dark' },
    { label: 'Светлая', value: 'light' },
    { label: 'Системная', value: 'system' },
  ]
  photoQualityOptions: OptionsRadioButton[] = [
    { label: 'Оригинал', value: 'a' },
    { label: 'Стандарт', value: 'd' },
    { label: 'Миниатюра', value: 'h' },
  ]
  mapTypeOptions: OptionsRadioButton[] = [
    { label: 'Стандарт', value: 'standard' },
    { label: 'Спутник', value: 'satellite' },
    { label: 'Гибрид', value: 'hybrid' },
    { label: 'Рельеф', value: 'terrain' },
  ]
  markerTypeOptions: OptionsRadioButton[] = [
    { label: 'Новый', value: 'new' },
    { label: 'Старый', value: 'old' },
  ]
  constructor() {
    super()
    makeObservable(this)
  }
  // ------------------------------------------ Computed ------------------------------------------
  // ------------------------------------------ Actions ------------------------------------------
}

export default AppSettingsVM
