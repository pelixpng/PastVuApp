import { MenuButton } from '../../components/ui/buttons/MenuButton'
import { ViewContainer } from '../../components/ui/Containers'

export const SettingsComponent = () => {
  return (
    <ViewContainer>
      <MenuButton
        route={'MapSettings'}
        title={'Настройки'}
        description={'Параметры интерфейса и карты'}
        icon={'settings'}
      />
      <MenuButton
        route={'FeedBack'}
        title={'Обратная связь'}
        description={'Контакты с разработчиком'}
        icon={'mail'}
      />
      <MenuButton
        route={'AppInfo'}
        title={'О приложении'}
        description={'Версия и используемые ресурсы'}
        icon={'info'}
      />
    </ViewContainer>
  )
}
