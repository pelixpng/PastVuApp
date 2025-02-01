import { action, makeObservable } from 'mobx'
import { BaseViewModelProvider } from '../../../store/vm.provider'
import { SCREENS } from '../../../navigation/navigation.types'

class SettingsVM extends BaseViewModelProvider<SCREENS.SETTINGS_MENU> {
  constructor() {
    super()
    makeObservable(this)
  }
  // ------------------------------------------ Computed ------------------------------------------
  // ------------------------------------------ Actions ------------------------------------------

  @action.bound
  navToAboutApp() {
    this.navigateTo(SCREENS.ABOUT_APP)
  }

  @action.bound
  navToSettingsMap() {
    this.navigateTo(SCREENS.APP_SETTINGS)
  }

  @action.bound
  navToFeedBack() {
    this.navigateTo(SCREENS.SUPPORT_CONTACTS)
  }
}

export default SettingsVM
