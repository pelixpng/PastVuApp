import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { MaterialIcons } from '../../core/components/ui/icons'
import { Platform, StyleSheet } from 'react-native'
import { StackParamList } from './stackParams.types'
import { SCREENS } from './navigation.types'
import { useTheme } from '@react-navigation/native'
import { MapScreen } from '../screen/map/Map.screen'
import { CollectionScreen } from '../screen/collection/Collection.screen'
import { NewsScreen } from '../screen/news/News.screen'
import { SettingsMenuScreen } from '../screen/settings/settingsMenu/SettingsMenu.screen'
import { t } from '../../core/i18n'
import { observer } from 'mobx-react-lite'
import { useHeaderEdgeStyles } from '../../core/hooks/useHeaderEdgeStyles'
import { useTabletLayout } from '../hooks/useTabletLayout'
import { useTabletHeader } from '../hooks/useTabletHeader'

const Tab = createBottomTabNavigator<StackParamList>()

export const BottomTabsNavigator = observer(function BottomTabsNavigator() {
  const { colors } = useTheme()
  const headerEdgeStyles = useHeaderEdgeStyles('left')
  // The stack above provides the safe-area frame this reads, so a turn or a resize restyles the
  // bar in place.
  const layout = useTabletLayout()
  const header = useTabletHeader()
  return (
    <Tab.Navigator
      // Keep inactive tabs attached: detaching tears the native MapView out of the hierarchy, and
      // rebuilding it on return redraws the map and loses part of the markers.
      detachInactiveScreens={false}
      screenOptions={{
        tabBarActiveTintColor: colors.basePrimary,
        tabBarInactiveTintColor: colors.textThird,
        tabBarStyle: {
          backgroundColor: colors.backgroundApp,
          position: 'absolute',
          // Floats under the map's left column, at the column's width, so both follow the same
          // numbers. `start`, not `left`: the bar pins itself with start/end, and start wins over
          // left.
          start: layout.tabBar.start,
          width: layout.tabBar.width,
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          // Bottom-tabs pads its bar by the side insets, as wide as iPhone Duo's vertical bar: this
          // one only floats under the column, which already keeps clear of it.
          paddingHorizontal: 0,
        },
        headerStyle: {
          backgroundColor: colors.backgroundApp,
          ...header.style,
        },
        headerShadowVisible: false,
        headerTitle: '',
        headerTitleAlign: 'left',
        ...headerEdgeStyles,
        headerStatusBarHeight: header.statusBarHeight,
        headerRightContainerStyle: [
          headerEdgeStyles.headerRightContainerStyle,
          header.rightContainer,
        ],
        // The title keeps 16 from the back arrow News puts on the left, as it does from the edge:
        // next to a left button react-navigation cuts the gap to 4.
        headerTitleContainerStyle: [
          s.headerTitleContainer,
          headerEdgeStyles.headerTitleContainerStyle,
        ],
        headerTitleStyle: s.headerTitleStyle,
        headerTintColor: colors.textFirst,
        // Only where the keyboard lifts the window with the bar on it. On iOS it covers the bar
        // anyway, and a keyboard shown as the interface changed (iPhone Duo folding, App.tsx) left
        // bottom-tabs thinking it was still up, and the bar gone.
        tabBarHideOnKeyboard: Platform.OS === 'android',
        tabBarLabelStyle: [
          s.tabBarLabelStyle,
          layout.tabBar.width < TIGHT_BAR_WIDTH && s.tightTabBarLabel,
        ],
        // Under the icons on a narrow bar in a portrait window, where 'Коллекция' beside its icon
        // does not fit in a quarter of it. Otherwise undefined: bottom-tabs then makes its own
        // choice, beside the icons on a tablet, so landscape keeps the same bar at every width.
        // On a tablet the bar's height does not depend on it.
        tabBarLabelPosition: layout.labelPosition,
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
 * Narrower than this, a quarter of the bar less bottom-tabs' 5 pt item padding on each side does
 * not hold 'Настройки' (61 pt) or 'Коллекция' (60 pt) at 11 pt: on an unfolded iPhone in portrait,
 * whose column is about 270 pt. The labels then take the 10 pt iOS uses in its own tab bars.
 */
const TIGHT_BAR_WIDTH = 284

const s = StyleSheet.create({
  headerTitleContainer: { marginStart: 16 },
  tabBarLabelStyle: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '500',
  },
  tightTabBarLabel: { fontSize: 10 },
  headerTitleStyle: {
    fontSize: 24,
    lineHeight: 28,
    fontWeight: 'bold',
  },
})
