import React, { FC } from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { SettingsComponent } from '../screens/settings/Settings'
import { AppInfo } from '../screens/settings/AboutApp'
import { FeedBack } from '../screens/settings/FeedBack'
import { MapSettings } from '../screens/settings/MapSettings'
import { DefaultTheme, useTheme } from 'styled-components'
import { SettingsStackParamList } from '../types/navigation'

const SettingsStack = createStackNavigator<SettingsStackParamList>()

export const SettingsNavigation: FC = () => {
  const theme: DefaultTheme = useTheme()
  return (
    <SettingsStack.Navigator
      initialRouteName={'SettingsComponent'}
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.backgroundApp,
          elevation: 0,
        },
        headerShadowVisible: false,
        headerBackTitle: 'Назад',
        title: '',
        headerTintColor: theme.colors.titleMenuText,
        presentation: 'transparentModal',
      }}>
      <SettingsStack.Screen
        name={'SettingsComponent'}
        component={SettingsComponent}
        options={{
          headerShown: false,
        }}
      />
      <SettingsStack.Screen name={'AppInfo'} component={AppInfo} />
      <SettingsStack.Screen name={'MapSettings'} component={MapSettings} />
      <SettingsStack.Screen name={'FeedBack'} component={FeedBack} />
    </SettingsStack.Navigator>
  )
}
