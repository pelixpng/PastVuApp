import { action, makeObservable } from 'mobx'
import { SCREENS } from '../../../navigation/navigation.types'
import { BaseViewModelProvider } from '../../../store/vm.provider'
import * as Application from 'expo-application'
import { Linking } from 'react-native'

export enum LinkKeys {
  TelegramDeveloper = 'https://t.me/semenKuzminWork',
  TelegramDesigner = 'https://t.me/ArtemWaves',
  Web = 'https://pastvu.com/',
  SourceCode = 'https://github.com/pelixpng/PastVuApp',
  AboutPastVu = 'https://docs.pastvu.com/about',
  PastVuAPI = 'https://docs.pastvu.com/dev/api',
  MapsPlatformAPI = 'https://developers.google.com/maps?hl=ru',
}

class AboutAppVM extends BaseViewModelProvider<SCREENS.ABOUT_APP> {
  version = Application.nativeApplicationVersion
  links = {
    telegramDeveloper: 'https://t.me/semenKuzminWork',
    telegramDesigner: 'https://t.me/ArtemWaves',
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
