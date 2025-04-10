import { action, makeObservable } from 'mobx'
import { SCREENS } from '../../../navigation/navigation.types'
import { BaseViewModelProvider } from '../../../store/vm.provider'
import { Linking } from 'react-native'

class AboutAppVM extends BaseViewModelProvider<SCREENS.ABOUT_APP> {
  links = {
    telegramDeveloper: 'https://t.me/semenKuzminWork',
    telegramDesigner: 'https://t.me/ArtemWaves',
    telegramChanel: 'https://t.me/pastvumobile',
    web: 'https://pastvu.com/',
    sourceCode: 'https://github.com/pelixpng/PastVuApp',
    aboutPastVu: 'https://docs.pastvu.com/about',
    pastVuAPI: 'https://docs.pastvu.com/dev/api',
    mapsPlatformAPI: 'https://developers.google.com/maps?hl=ru',
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

export default AboutAppVM
