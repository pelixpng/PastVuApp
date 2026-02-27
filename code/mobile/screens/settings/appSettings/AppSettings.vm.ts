import { makeObservable } from 'mobx'
import { Alert, Platform } from 'react-native'
import MapStore from '../../../../core/store/Map.store'
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
  mapProviderOptions: OptionsRadioButton[] = [
    {
      label: Platform.OS === 'ios' ? 'Apple Maps' : 'Google Maps',
      value: Platform.OS === 'ios' ? 'apple' : 'google',
    },
    { label: 'Яндекс Карты (Beta)', value: 'yandex' },
  ]
  constructor() {
    super()
    makeObservable(this)
  }
  // ------------------------------------------ Computed ------------------------------------------
  // ------------------------------------------ Actions ------------------------------------------
  setMapProvider = (value: string) => {
    MapStore.setMapProvider(value)
    if (value === 'yandex') {
      Alert.alert(
        'Яндекс Карты (Beta)',
        'Карта находится в ранней версии, возможны баги и нестабильная работа.\n\n' +
          'При тёмной теме отображение может быть некорректным — рекомендуется светлая тема.\n\n' +
          'Слои «Спутник» и «Гибрид» в данный момент не поддерживаются.\n\n' +
          `Бесплатный API Яндекс Карт рассчитан на 1000 пользователей в день. Если карта не загружается — лимит возможно исчерпан. В таком случае рекомендуется переключиться на ${Platform.OS === 'ios' ? 'Apple Maps' : 'Google Maps'}.`,
        [{ text: 'Понятно' }],
      )
    }
  }
}

export default AppSettingsVM
