import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { MapComponent } from '../screens/map/MapView'
import { DefaultTheme, useTheme } from 'styled-components'
import { MaterialIcons } from '@expo/vector-icons'
import { StyleSheet } from 'react-native'
import { SettingsComponent } from '../screens/settings/Settings'
import { History } from '../screens/map/History'

const Tab = createBottomTabNavigator()

export function BottomNavigator() {
  const theme: DefaultTheme = useTheme()
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.basePrimary,
        tabBarInactiveTintColor: theme.colors.textThird,
        tabBarStyle: {
          backgroundColor: theme.colors.backgroundApp,
          borderTopWidth: 0,
        },
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: theme.colors.backgroundApp,
        },
        headerTitle: '',
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: s.tabBarLabelStyle,
      }}>
      <Tab.Screen
        name={'MapComponent'}
        component={MapComponent}
        options={{
          headerShown: false,
          title: 'Карта',
          tabBarIcon: ({ color }) => <MaterialIcons name="map" size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name={'History'}
        component={History}
        options={{
          title: 'История',
          tabBarIcon: ({ color }) => <MaterialIcons name="history" size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name={'SettingsComponent'}
        component={SettingsComponent}
        options={{
          title: 'Настройки',
          tabBarIcon: ({ color }) => <MaterialIcons name="settings" size={24} color={color} />,
        }}
      />
    </Tab.Navigator>
  )
}

const s = StyleSheet.create({
  tabBarLabelStyle: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '500',
  },
})
