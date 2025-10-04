import { MyButton } from '../../../components/ui/buttons/MyButton'
import { useVM } from '../../../hooks/useVM'
import SupportContactsVM from './SupportContacts.vm'
import { Container } from '../../../components/ui/Container'
import { UICard } from '../../../components/ui/UICards'
import { useTheme } from '@react-navigation/native'
import { StyleSheet, Text } from 'react-native'
import { Spacer } from '../../../components/ui/Spacer'

export const SupportContactsScreen = () => {
  const vm = useVM(SupportContactsVM)
  const { colors } = useTheme()
  return (
    <Container>
      <Spacer height={3} />
      <UICard>
        <Text style={[s.titleText, { color: colors.textFirst }]}>Нужна помощь?</Text>
        <Spacer height={4} />
        <Text style={[s.descriptionText, { color: colors.textSecond }]}>
          Если у вас возникли проблемы во время использования приложения, вы можете связаться с
          разработчиком через почту или телеграмм.
        </Text>
        <Spacer height={16} />
        <MyButton title={'Telegram'} func={() => vm.openLink('telegram')} />
        <Spacer height={16} />
        <MyButton title={'Почта'} func={() => vm.openLink('email')} />
      </UICard>
    </Container>
  )
}

const s = StyleSheet.create({
  descriptionText: {
    fontWeight: '400',
    fontSize: 13,
    lineHeight: 20,
  },
  titleText: {
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '800',
  },
})
