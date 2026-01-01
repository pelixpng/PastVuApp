import { action, makeObservable, observable } from 'mobx'
import { SCREENS } from '../../../navigation/navigation.types'
import { BaseViewModelProvider } from '../../../provider/vm.provider'

export type MenuSettings = 'appSettings' | 'aboutApp' | 'supportContacts'

class SettingsVM extends BaseViewModelProvider<SCREENS.SETTINGS_MENU> {
  @observable selectedMenu: MenuSettings = 'appSettings'
  constructor() {
    super()
    makeObservable(this)
  }
  // ------------------------------------------ Computed ------------------------------------------
  // ------------------------------------------ Actions ------------------------------------------

  @action.bound
  selectMenu(value: MenuSettings) {
    this.selectedMenu = value
  }
}

export default SettingsVM
