import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { StyleSheet } from 'react-native'
import { StackParamList } from './stackParams.types'
import { SCREENS } from './navigation.types'
import { MapScreen } from '../screens/home/map/Map.screen'
import { CollectionScreen } from '../screens/home/collection/Collection.screen'
import { NewsScreen } from '../screens/home/news/News.screen'
import { SettingsMenuScreen } from '../screens/settings/settingsMenu/SettingsMenu.screen'
import { useTheme } from '@react-navigation/native'
import { t } from '../../core/i18n'
import { observer } from 'mobx-react'

const Tab = createBottomTabNavigator<StackParamList>()

export const BottomTabsNavigator = observer(function BottomTabsNavigator() {
  const { colors } = useTheme()
  return (
    <Tab.Navigator
      initialRouteName={SCREENS.MAP}
      // Keep inactive tabs attached: detaching tears the native MapView out of the hierarchy, and
      // rebuilding it on return redraws the map and loses part of the markers.
      detachInactiveScreens={false}
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
        name={SCREENS.MAP}
        component={MapScreen}
        options={{
          headerShown: false,
          title: t('tabs.map'),
          tabBarIcon: ({ color }) => <MaterialIcons name="map" size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name={SCREENS.PHOTO_HISTORY}
        component={CollectionScreen}
        options={{
          title: t('tabs.collection'),
          headerTitle: t('tabs.collection'),
          tabBarIcon: ({ color }) => <MaterialIcons name="favorite" size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name={SCREENS.NEWS}
        component={NewsScreen}
        options={{
          title: t('tabs.news'),
          headerTitle: t('headers.news'),
          tabBarIcon: ({ color }) => <MaterialIcons name="article" size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name={SCREENS.SETTINGS_MENU}
        component={SettingsMenuScreen}
        options={{
          title: t('tabs.settings'),
          headerTitle: t('tabs.settings'),
          tabBarIcon: ({ color }) => <MaterialIcons name="settings" size={24} color={color} />,
        }}
      />
    </Tab.Navigator>
  )
})

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
