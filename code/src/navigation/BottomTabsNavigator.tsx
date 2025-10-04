import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { MaterialIcons } from '@expo/vector-icons'
import { StyleSheet } from 'react-native'
import { StackParamList } from './stackParams.types'
import { SCREENS } from './navigation.types'
import { MapScreen } from '../screens/home/map/Map.screen'
import { PhotoHistoryScreen } from '../screens/home/photoHistory/PhotoHistory.screen'
import { SettingsMenuScreen } from '../screens/settings/settingsMenu/SettingsMenu.screen'
import { useTheme } from '@react-navigation/native'

const Tab = createBottomTabNavigator<StackParamList>()

export function BottomTabsNavigator() {
  const { colors } = useTheme()
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.basePrimary,
        tabBarInactiveTintColor: colors.textThird,
        tabBarStyle: {
          backgroundColor: colors.backgroundApp,
          borderTopWidth: 0,
        },
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: colors.backgroundApp,
        },
        headerTitle: '',
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: s.tabBarLabelStyle,
      }}>
      <Tab.Screen
        name={SCREENS.MAP}
        component={MapScreen}
        options={{
          headerShown: false,
          title: 'Карта',
          tabBarIcon: ({ color }) => <MaterialIcons name="map" size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name={SCREENS.PHOTO_HISTORY}
        component={PhotoHistoryScreen}
        options={{
          title: 'История',
          tabBarIcon: ({ color }) => <MaterialIcons name="history" size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name={SCREENS.SETTINGS_MENU}
        component={SettingsMenuScreen}
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
