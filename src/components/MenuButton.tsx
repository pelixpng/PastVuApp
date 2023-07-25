import React, { FC } from 'react'
import { Text, View } from 'react-native'
import { perfectSize } from '../utils/ScreenSize'
import { MenuContainer, MenuTextContainer, MenuTitleText, MenuDescriptionText, BackgroundMenuIcon } from './UniversalComponents'
import { Feather } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { SettingsRoutes } from '../navigation/Routes';
import { SettingsScreenNavigationProp } from '../types/Navigation.types';
import { MenuButtonProps } from '../types/components.types';


export const MenuButton: FC<MenuButtonProps> = ({ navigation, route, title, discription, icon }) => {
    const handlePress = () => {
        navigation.navigate(route);
    };
  return (
    <MenuContainer onPress={handlePress}>
         <MenuTextContainer>
          <MenuTitleText>{title}</MenuTitleText>
          <MenuDescriptionText>{discription}</MenuDescriptionText>
        </MenuTextContainer>
          <BackgroundMenuIcon>
              <Feather name={icon} size={perfectSize(22)} color="rgba(112, 182, 246, 1)" />
          </BackgroundMenuIcon>
    </MenuContainer>
  )
}


