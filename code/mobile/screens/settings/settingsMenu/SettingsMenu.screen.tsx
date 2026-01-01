import { observer } from 'mobx-react'
import SettingsVM from './SettingsMenu.vm'
import { Container } from '../../../../core/components/ui/Container'
import { MenuButton } from '../../../../core/components/ui/buttons/menuButton/MenuButton'
import { Spacer } from '../../../../core/components/ui/Spacer'
import { useVM } from '../../../../core/hooks/useVM'

export const SettingsMenuScreen = observer(() => {
  const vm = useVM(SettingsVM)
  return (
    <Container pdHorizontal={16}>
      <Spacer height={18} />
      <MenuButton
        onPress={vm.navToSettingsMap}
        title={'Основные'}
        description={'Параметры интерфейса и карты'}
        icon={'settings'}
      />
      <Spacer height={16} />
      <MenuButton
        onPress={vm.navToFeedBack}
        title={'Обратная связь'}
        description={'Контакты с разработчиком'}
        icon={'mail'}
      />
      <Spacer height={16} />
      <MenuButton
        onPress={vm.navToAboutApp}
        title={'О приложении'}
        description={'Версия и используемые ресурсы'}
        icon={'info'}
      />
    </Container>
  )
})
