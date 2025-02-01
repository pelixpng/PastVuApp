import { FC } from 'react'
import { MaterialIcons } from '@expo/vector-icons'
import { MenuContainer } from '../Containers'
import { View, StyleSheet } from 'react-native'
import { MenuDescriptionText, MenuTitleText } from '../Texts'

type MenuButtonProps = {
  title: string
  description: string
  icon: 'mail' | 'info' | 'settings' | 'history'
  onPress?: () => void
}

export const MenuButton: FC<MenuButtonProps> = ({ title, description, icon, onPress }) => {
  return (
    <MenuContainer onPress={onPress}>
      <View style={s.textBlock}>
        <MenuTitleText>{title}</MenuTitleText>
        <MenuDescriptionText>{description}</MenuDescriptionText>
      </View>
      <View style={s.bgIcon}>
        <MaterialIcons name={icon} size={28} color="white" />
      </View>
    </MenuContainer>
  )
}

const s = StyleSheet.create({
  textBlock: { flex: 1 },
  bgIcon: {
    width: 48,
    height: 48,
    borderRadius: 100,
    backgroundColor: '#428BF9',
    justifyContent: 'center',
    alignItems: 'center',
  },
})
