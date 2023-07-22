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
import { SafeAreaView } from 'react-native-safe-area-context'

export const SettingsComponent: React.FC<SettingsScreenNavigationProp> = ({navigation}) => {
  return (
    <SafeAreaView>
    <ScrollContainer>
      <MenuButton navigation={navigation} route={SettingsRoutes.FeedBack} title={'Обратная связь'} discription={'Контакты для связи с разработчиком'} icon={'mail'}/>
      <MenuButton navigation={navigation} route={SettingsRoutes.AppInfo} title={'О приложении'} discription={'Версия и используемые ресурсы'} icon={'info'}/>
      <MenuButton navigation={navigation} route={SettingsRoutes.MapSettings} title={'Настройки'} discription={'Настройки интерфейса и карты'} icon={'settings'}/>
    </ScrollContainer>
    </SafeAreaView>
  )
}

