import { View } from 'react-native'
import { ViewContainer } from '../../../components/ui/Containers'
import { UICard } from '../../../components/ui/UICards'
import { MenuDescriptionText, MenuTitleText } from '../../../components/ui/Texts'
import { MyButton } from '../../../components/ui/buttons/MyButton'
import { useVM } from '../../../hooks/useVM'
import SupportContactsVM from './SupportContacts.vm'

export const SupportContactsScreen = () => {
  const vm = useVM(SupportContactsVM)
  return (
    <ViewContainer>
      <UICard>
        <View>
          <MenuTitleText>Нужна помощь?</MenuTitleText>
          <MenuDescriptionText>
            Если у вас возникли проблемы во время использования приложения, вы можете связаться с
            разработчиком через почту или телеграмм.
          </MenuDescriptionText>
        </View>
        <MyButton title={'Telegram'} func={() => vm.openLink('telegram')} />
        <MyButton title={'Почта'} func={() => vm.openLink('email')} />
      </UICard>
    </ViewContainer>
  )
}
