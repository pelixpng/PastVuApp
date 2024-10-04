import { FC } from 'react'
import { MaterialIcons } from '@expo/vector-icons'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { RootStackParamList } from '../../../types/navigation'
import { MenuContainer } from '../Containers'
import { View, StyleSheet } from 'react-native'
import { MenuDescriptionText, MenuTitleText } from '../Texts'

type MenuButtonProps = {
  route?: 'AppInfo' | 'FeedBack' | 'SettingsComponent' | 'MapSettings'
  title: string
  description: string
  icon: 'mail' | 'info' | 'settings' | 'history'
}

export const MenuButton: FC<MenuButtonProps> = ({
  route,
  title,
  description: description,
  icon,
}) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()
  return (
    <MenuContainer onPress={() => route && navigation.navigate(route)}>
      <View style={{ flex: 1 }}>
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
  bgIcon: {
    width: 48,
    height: 48,
    borderRadius: 100,
    backgroundColor: '#428BF9',
    justifyContent: 'center',
    alignItems: 'center',
  },
})
