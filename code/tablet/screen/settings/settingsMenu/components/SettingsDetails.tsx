import { FC } from 'react'
import { View } from 'react-native'
import { MenuSettings } from '../SettingsMenu.vm'
import { SupportContactsScreen } from '../../supportContacts/SupportContacts.screen'
import { AboutAppScreen } from '../../aboutApp/AboutApp.screen'
import { AppSettingsScreen } from '../../appSettings/AppSettings.screen'
import { TabletLayout } from '../../../../hooks/useTabletLayout'
import { settingsDetailsLayout } from '../settingsDetailsLayout'

type SettingsDetailProps = {
  selectedWindow: MenuSettings
  /** The window's pane sizes. Each section fills the width the menu leaves, to the right edge. */
  layout: TabletLayout
}

export const SettingsDetails: FC<SettingsDetailProps> = ({ selectedWindow, layout }) => {
  const { padding, wide } = settingsDetailsLayout(layout)
  switch (selectedWindow) {
    case 'appSettings':
      return <AppSettingsScreen style={padding} />
    case 'aboutApp':
      return <AboutAppScreen style={padding} wide={wide} />
    case 'supportContacts':
      return <SupportContactsScreen style={padding} wide={wide} />
    default:
      return <View />
  }
}
