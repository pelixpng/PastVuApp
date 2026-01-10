import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { MaterialIcons } from '@expo/vector-icons'
import { StyleSheet } from 'react-native'
import { StackParamList } from './stackParams.types'
import { SCREENS } from './navigation.types'
import { MapScreen } from '../screens/home/map/Map.screen'
import { PhotoHistoryScreen } from '../screens/home/photoHistory/PhotoHistory.screen'
import { NewsScreen } from '../screens/home/news/News.screen'
import { SettingsMenuScreen } from '../screens/settings/settingsMenu/SettingsMenu.screen'
import { useTheme } from '@react-navigation/native'

const Tab = createBottomTabNavigator<StackParamList>()

export function BottomTabsNavigator() {
  const { colors } = useTheme()
  return (
    <Tab.Navigator
      initialRouteName={SCREENS.MAP}
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
        headerTitleAlign: 'left',
        headerTitleStyle: s.headerTitleStyle,
        headerTintColor: colors.textFirst,
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: s.tabBarLabelStyle,
      }}>
      <Tab.Screen
        name={SCREENS.NEWS}
        component={NewsScreen}
        options={{
          title: 'Новости',
          headerTitle: 'Новости',
          tabBarIcon: ({ color }) => <MaterialIcons name="article" size={24} color={color} />,
        }}
      />
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
          title: 'Коллекция',
          headerTitle: 'Коллекция',
          tabBarIcon: ({ color }) => <MaterialIcons name="favorite" size={24} color={color} />,
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
