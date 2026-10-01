import { observer } from 'mobx-react-lite'
import SettingsVM from './SettingsMenu.vm'
import { Container } from '../../../../core/components/ui/Container'
import { MenuButton } from '../../../../core/components/ui/buttons/menuButton/MenuButton'
import { Spacer } from '../../../../core/components/ui/Spacer'
import { useVM } from '../../../../core/hooks/useVM'
import { View, StyleSheet, useWindowDimensions } from 'react-native'
import { SettingsDetails } from './components/SettingsDetails'
import { t } from '../../../../core/i18n'

export const SettingsMenuScreen = observer(() => {
  const vm = useVM(SettingsVM)
  const { width } = useWindowDimensions()
  const widthMenu = width * 0.33 + 32
  return (
    <Container row>
      <View style={[{ width: widthMenu }, s.menu]}>
        <Spacer height={18} />
        <MenuButton
          onPress={() => vm.selectMenu('appSettings')}
          title={t('settingsMenu.general')}
          description={t('settingsMenu.generalHint')}
          icon={'settings'}
        />
        <Spacer height={16} />
        <MenuButton
          onPress={() => vm.selectMenu('supportContacts')}
          title={t('settingsMenu.feedback')}
          description={t('settingsMenu.feedbackHint')}
          icon={'mail'}
        />
        <Spacer height={16} />
        <MenuButton
          onPress={() => vm.selectMenu('aboutApp')}
          title={t('settingsMenu.about')}
          description={t('settingsMenu.aboutHint')}
          icon={'info'}
        />
      </View>
      <SettingsDetails selectedWindow={vm.selectedMenu} />
    </Container>
  )
})

const s = StyleSheet.create({
  menu: {
    paddingHorizontal: 16,
  },
})
