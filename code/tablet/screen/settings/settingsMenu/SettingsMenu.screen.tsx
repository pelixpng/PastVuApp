import { observer } from 'mobx-react'
import SettingsVM from './SettingsMenu.vm'
import { Container } from '../../../../core/components/ui/Container'
import { MenuButton } from '../../../../core/components/ui/buttons/menuButton/MenuButton'
import { Spacer } from '../../../../core/components/ui/Spacer'
import { useVM } from '../../../../core/hooks/useVM'
import { View, StyleSheet, useWindowDimensions } from 'react-native'
import { SettingsDetails } from './components/SettingsDetails'

export const SettingsMenuScreen = observer(() => {
  const vm = useVM(SettingsVM)
  const { width } = useWindowDimensions()
  const widthMenu = width * 0.33 + 32
  return (
    <Container row>
      <View style={[{ width: widthMenu }, s.menu]}>
        <Spacer height={4} />
        <MenuButton
          onPress={() => vm.selectMenu('appSettings')}
          title={'Основные'}
          description={'Параметры интерфейса и карты'}
          icon={'settings'}
        />
        <Spacer height={16} />
        <MenuButton
          onPress={() => vm.selectMenu('supportContacts')}
          title={'Обратная связь'}
          description={'Контакты с разработчиком'}
          icon={'mail'}
        />
        <Spacer height={16} />
        <MenuButton
          onPress={() => vm.selectMenu('aboutApp')}
          title={'О приложении'}
          description={'Версия и используемые ресурсы'}
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
