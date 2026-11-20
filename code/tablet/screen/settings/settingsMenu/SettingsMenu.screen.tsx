import { observer } from 'mobx-react-lite'
import SettingsVM from './SettingsMenu.vm'
import { Container } from '../../../../core/components/ui/Container'
import { MenuButton } from '../../../../core/components/ui/buttons/menuButton/MenuButton'
import { Spacer } from '../../../../core/components/ui/Spacer'
import { useVM } from '../../../../core/hooks/useVM'
import { View, StyleSheet } from 'react-native'
import { SettingsDetails } from './components/SettingsDetails'
import { useTabletLayout } from '../../../hooks/useTabletLayout'
import { t } from '../../../../core/i18n'

export const SettingsMenuScreen = observer(() => {
  const vm = useVM(SettingsVM)
  // The menu's cards line up with the left column and the tab bar under it; the details beside
  // them take the rest of the window.
  const layout = useTabletLayout()
  return (
    <Container row>
      <View style={[{ width: layout.menuWidth, marginLeft: layout.leftInset }, s.menu]}>
        <Spacer height={18} />
        <MenuButton
          onPress={() => vm.selectMenu('appSettings')}
          selected={vm.selectedMenu === 'appSettings'}
          title={t('settingsMenu.general')}
          description={t('settingsMenu.generalHint')}
          icon={'settings'}
        />
        <Spacer height={16} />
        <MenuButton
          onPress={() => vm.selectMenu('supportContacts')}
          selected={vm.selectedMenu === 'supportContacts'}
          title={t('settingsMenu.feedback')}
          description={t('settingsMenu.feedbackHint')}
          icon={'mail'}
        />
        <Spacer height={16} />
        <MenuButton
          onPress={() => vm.selectMenu('aboutApp')}
          selected={vm.selectedMenu === 'aboutApp'}
          title={t('settingsMenu.about')}
          description={t('settingsMenu.aboutHint')}
          icon={'info'}
        />
      </View>
      <SettingsDetails selectedWindow={vm.selectedMenu} layout={layout} />
    </Container>
  )
})

const s = StyleSheet.create({
  menu: {
    paddingHorizontal: 16,
  },
})
