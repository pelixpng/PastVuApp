import { ScrollContainer } from '../../components/ui/UniversalComponents'
import { MenuButton } from '../../components/buttons/MenuButton'
import { INSET_TOP } from '../../constants/sizes'

export const SettingsComponent = () => {
  return (
    <ScrollContainer paddingTop={INSET_TOP}>
      <MenuButton
        route={'FeedBack'}
        title={'Обратная связь'}
        description={'Контакты для связи с разработчиком'}
        icon={'mail'}
      />
      <MenuButton
        route={'AppInfo'}
        title={'О приложении'}
        description={'Версия и используемые ресурсы'}
        icon={'info'}
      />
      <MenuButton
        route={'MapSettings'}
        title={'Настройки'}
        description={'Настройки интерфейса и карты'}
        icon={'settings'}
      />
    </ScrollContainer>
  )
}
