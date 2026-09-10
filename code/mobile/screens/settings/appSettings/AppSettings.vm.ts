import { makeObservable } from 'mobx'
import { SCREENS } from '../../../navigation/navigation.types'
import { BaseViewModelProvider } from '../../../provider/vm.provider'
import { SettingsOptions } from '../../../../core/constants/settings'

class AppSettingsVM extends BaseViewModelProvider<SCREENS.APP_SETTINGS> {
  // Delegates to the shared option lists so the labels are built once, in the current language.
  showClusterOptions = SettingsOptions.showClusterOptions
  themeOptions = SettingsOptions.themeOptions
  photoQualityOptions = SettingsOptions.photoQualityOptions
  mapTypeOptions = SettingsOptions.mapTypeOptions
  markerTypeOptions = SettingsOptions.markerTypeOptions

  constructor() {
    super()
    makeObservable(this)
  }
  // ------------------------------------------ Computed ------------------------------------------
  // ------------------------------------------ Actions ------------------------------------------
}

export default AppSettingsVM
