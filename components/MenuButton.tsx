import React, { FC } from 'react'
import { Text, View } from 'react-native'
import { perfectSize } from '../utils/ScreenSize'
import { MenuContainer, MenuTextContainer, MenuTitleText, MenuDescriptionText, BackgroundMenuIcon } from './UniversalComponents'
import { Feather } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { SettingsRoutes } from '../navigation/Routes';
import { SettingsScreenNavigationProp } from '../types/Navigation.types';


export const MenuButton: FC<{ navigation: any }> = ({ navigation }) => {
    const handlePress = () => {
        navigation.navigate(SettingsRoutes.FeedBack);
      };
  return (
    <MenuContainer onPress={handlePress}>
         <MenuTextContainer>
          <MenuTitleText>Обратная связь</MenuTitleText>
          <MenuDescriptionText>Контакты для связи с разработчиком</MenuDescriptionText>
        </MenuTextContainer>
          <BackgroundMenuIcon>
              <Feather name="mail" size={perfectSize(22)} color="rgba(112, 182, 246, 1)" />
          </BackgroundMenuIcon>
    </MenuContainer>
  )
}


