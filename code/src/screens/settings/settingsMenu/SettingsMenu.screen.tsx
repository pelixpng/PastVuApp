import { observer } from 'mobx-react'
import { MenuButton } from '../../../components/ui/buttons/MenuButton'
import { ViewContainer } from '../../../components/ui/Containers'
import { useVM } from '../../../hooks/useVM'
import SettingsVM from './SettingsMenu.vm'

export const SettingsMenuScreen = observer(() => {
  const vm = useVM(SettingsVM)
  return (
    <ViewContainer>
      <MenuButton
        onPress={vm.navToSettingsMap}
        title={'Настройки'}
        description={'Параметры интерфейса и карты'}
        icon={'settings'}
      />
      <MenuButton
        onPress={vm.navToFeedBack}
        title={'Обратная связь'}
        description={'Контакты с разработчиком'}
        icon={'mail'}
      />
      <MenuButton
        onPress={vm.navToAboutApp}
        title={'О приложении'}
        description={'Версия и используемые ресурсы'}
        icon={'info'}
      />
    </ViewContainer>
  )
})
