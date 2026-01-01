import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { MaterialIcons } from '@expo/vector-icons'
import { StyleSheet } from 'react-native'
import { StackParamList } from './stackParams.types'
import { SCREENS } from './navigation.types'
import { useTheme } from '@react-navigation/native'
import { MapScreen } from '../screen/map/Map.screen'
import { PhotoHistoryScreen } from '../screen/history/PhotoHistory.screen'
import { SettingsMenuScreen } from '../screen/settings/settingsMenu/SettingsMenu.screen'

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
          position: 'absolute',
          width: '33%',
          left: 16,
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerStyle: {
          backgroundColor: colors.backgroundApp,
        },
        headerShadowVisible: false,
        headerTitle: '',
        headerTitleAlign: 'left',
        headerTitleStyle: s.headerTitleStyle,
        headerTintColor: colors.textFirst,
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
          headerTitle: 'История',
          tabBarIcon: ({ color }) => <MaterialIcons name="history" size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name={SCREENS.SETTINGS_MENU}
        component={SettingsMenuScreen}
        options={{
          title: 'Настройки',
          headerTitle: 'Настройки',
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
  headerTitleStyle: {
    fontSize: 24,
    lineHeight: 28,
    fontWeight: 'bold',
  },
})
