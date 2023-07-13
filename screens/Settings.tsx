import { FC } from 'react'
import { Platform, Text, View } from 'react-native'
import styled, { DefaultTheme } from 'styled-components/native'
import { perfectSize } from '../utils/ScreenSize'
import { ScrollContainer, MenuContainer, MenuTextContainer, MenuTitleText, MenuDescriptionText, BackgroundMenuIcon } from '../components/UniversalComponents'
import { Feather } from '@expo/vector-icons';
import { MenuButton } from '../components/MenuButton'
import { useNavigation, useRoute } from '@react-navigation/native'
import { SettingsRoutes } from '../navigation/Routes'
import { SettingsScreenNavigationProp } from '../types/Navigation.types'
import { AppInfo } from './AboutApp'


export const SettingsComponent: React.FC<SettingsScreenNavigationProp> = ({navigation}) => {
  const route = useRoute();
  return (
    <ScrollContainer>
      <MenuButton navigation={navigation}/>
    </ScrollContainer>
  )
}

