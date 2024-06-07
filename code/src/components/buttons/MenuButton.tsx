import { FC } from 'react'
import {
  MenuContainer,
  MenuTextContainer,
  MenuTitleText,
  MenuDescriptionText,
  BackgroundMenuIcon,
} from '../ui/UniversalComponents'
import { MaterialIcons } from '@expo/vector-icons'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { perfectSize } from '../../utils/ScreenSize'
import { RootStackParamList } from '../../types/navigation'

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
      <MenuTextContainer>
        <MenuTitleText>{title}</MenuTitleText>
        <MenuDescriptionText>{description}</MenuDescriptionText>
      </MenuTextContainer>
      <BackgroundMenuIcon>
        <MaterialIcons name={icon} size={perfectSize(22)} color="white" />
      </BackgroundMenuIcon>
    </MenuContainer>
  )
}
