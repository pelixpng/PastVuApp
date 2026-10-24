import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { MaterialIcons } from '../../core/components/ui/icons'
import { StyleSheet, View } from 'react-native'
import { StackParamList } from './stackParams.types'
import { SCREENS } from './navigation.types'
import { MapScreen } from '../screens/home/map/Map.screen'
import { CollectionScreen } from '../screens/home/collection/Collection.screen'
import { NewsScreen } from '../screens/home/news/News.screen'
import { SettingsMenuScreen } from '../screens/settings/settingsMenu/SettingsMenu.screen'
import { useTheme } from '@react-navigation/native'
import { t } from '../../core/i18n'
import { observer } from 'mobx-react-lite'
import { PortalHost, PortalProvider } from '../../core/components/ui/portal/Portal'

const Tab = createBottomTabNavigator<StackParamList>()

const Tabs = observer(function Tabs() {
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

/**
 * The tabs, with a portal layer over them and over the tab bar: the map's nearby-photos sheet draws
 * there to cover the bar. The layer belongs to the tabs' stack card, so a photo opened from the
 * sheet slides in over it as over the rest of the map, and the card's gesture-handler root also
 * serves the sheet's drag.
 */
export const BottomTabsNavigator = () => (
  <PortalProvider>
    <View style={s.container}>
      <Tabs />
      <PortalHost />
    </View>
  </PortalProvider>
)

const s = StyleSheet.create({
  container: { flex: 1 },
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
