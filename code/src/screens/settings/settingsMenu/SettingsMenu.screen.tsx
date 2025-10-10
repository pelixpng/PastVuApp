import { observer } from 'mobx-react'
import { useVM } from '../../../hooks/useVM'
import SettingsVM from './SettingsMenu.vm'
import { Container } from '../../../components/ui/Container'
import { MenuButton } from '../../../components/ui/buttons/menuButton/MenuButton'
import { Spacer } from '../../../components/ui/Spacer'

export const SettingsMenuScreen = observer(() => {
  const vm = useVM(SettingsVM)
  return (
    <Container>
      <Spacer height={3} />
      <MenuButton
        onPress={vm.navToSettingsMap}
        title={'Настройки'}
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
