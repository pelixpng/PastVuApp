import { action, makeObservable } from 'mobx'
import { BaseViewModelProvider } from '../../../store/vm.provider'
import { SCREENS } from '../../../navigation/navigation.types'
import { Linking } from 'react-native'

class SupportContactsVM extends BaseViewModelProvider<SCREENS.SUPPORT_CONTACTS> {
  links = {
    telegram: 'https://t.me/semenKuzminWork',
    email: 'mailto:semeonky@gmail.com',
  }

  constructor() {
    super()
    makeObservable(this)
  }

  // ------------------------------------------ Computed ------------------------------------------
  // ------------------------------------------ Actions ------------------------------------------

  @action.bound
  openLink(key: keyof typeof this.links) {
    Linking.openURL(this.links[key])
  }
}

export default SupportContactsVM
