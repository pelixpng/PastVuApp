import { observer } from 'mobx-react'
import SettingsVM from './SettingsMenu.vm'
import { Container } from '../../../../core/components/ui/Container'
import { MenuButton } from '../../../../core/components/ui/buttons/menuButton/MenuButton'
import { Spacer } from '../../../../core/components/ui/Spacer'
import { useVM } from '../../../../core/hooks/useVM'
import { t } from '../../../../core/i18n'

export const SettingsMenuScreen = observer(() => {
  const vm = useVM(SettingsVM)
  return (
    <Container pdHorizontal={16}>
      <Spacer height={18} />
      <MenuButton
        onPress={vm.navToSettingsMap}
        title={t('settingsMenu.general')}
        description={t('settingsMenu.generalHint')}
        icon={'settings'}
      />
      <Spacer height={16} />
      <MenuButton
        onPress={vm.navToFeedBack}
        title={t('settingsMenu.feedback')}
        description={t('settingsMenu.feedbackHint')}
        icon={'mail'}
      />
      <Spacer height={16} />
      <MenuButton
        onPress={vm.navToAboutApp}
        title={t('settingsMenu.about')}
        description={t('settingsMenu.aboutHint')}
        icon={'info'}
      />
    </Container>
  )
})
