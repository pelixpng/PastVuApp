import { FC } from 'react'
import { View } from 'react-native'
import { MenuSettings } from '../SettingsMenu.vm'
import { SupportContactsScreen } from '../../supportContacts/SupportContacts.screen'
import { AboutAppScreen } from '../../aboutApp/AboutApp.screen'
import { AppSettingsScreen } from '../../appSettings/AppSettings.screen'

type SettingsDetailProps = {
  selectedWindow: MenuSettings
}

export const SettingsDetails: FC<SettingsDetailProps> = ({ selectedWindow }) => {
  switch (selectedWindow) {
    case 'appSettings':
      return <AppSettingsScreen />
    case 'aboutApp':
      return <AboutAppScreen />
    case 'supportContacts':
      return <SupportContactsScreen />
    default:
      return <View />
  }
}
