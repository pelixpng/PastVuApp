import { createRef, useEffect, useMemo } from 'react'
import { AppState, Platform, StatusBar, useColorScheme, View, StyleSheet } from 'react-native'
import { MaterialIcons } from '../core/components/ui/icons'
import { observer } from 'mobx-react-lite'
import { SystemBars } from 'react-native-edge-to-edge'
import { createStackNavigator } from '@react-navigation/stack'
import {
  NavigationContainer,
  NavigationContainerRef,
  ParamListBase,
} from '@react-navigation/native'
import { DarkTheme, LightTheme } from '../core/components/theme/Theme'
import ThemeStore from '../core/store/Theme.store'
import { StackParamList } from './navigation/stackParams.types'
import { SCREENS } from './navigation/navigation.types'
import { Spacer } from '../core/components/ui/Spacer'
import { HeaderIconButton } from '../core/components/ui/buttons/HeaderIconButton'
import { FullScreenImage } from './screens/home/fullScreenImage/FullScreenImage'
import { BottomTabsNavigator } from './navigation/BottomTabsNavigator'
import { PhotoDetailScreen } from './screens/home/photoDetail/PhotoDetail.screen'
import { AboutAppScreen } from './screens/settings/aboutApp/AboutApp.screen'
import { AppSettingsScreen } from './screens/settings/appSettings/AppSettings.screen'
import { SupportContactsScreen } from './screens/settings/supportContacts/SupportContacts.screen'
import { NewsPostScreen } from './screens/home/newsPost/NewsPost.screen'
import { CompareScreen } from './screens/home/compare/Compare.screen'
import { t } from '../core/i18n'

export const Stack = createStackNavigator<StackParamList>()
export let NavigationRef = createRef<NavigationContainerRef<ParamListBase>>()

export default observer(function AppMobile() {
  const colorScheme = useColorScheme()
  const theme = useMemo(() => {
    const isSystemTheme = ThemeStore.selectedTheme === 'system'
    const isLightTheme =
      ThemeStore.selectedTheme === 'light' || (isSystemTheme && colorScheme === 'light')
    return isLightTheme ? LightTheme : DarkTheme
  }, [ThemeStore.selectedTheme, colorScheme])
  useEffect(() => {
    if (Platform.OS !== 'android') return
    const apply = () =>
      StatusBar.setBarStyle(theme === DarkTheme ? 'light-content' : 'dark-content', true)
    apply()
    // Re-applied on return to the foreground: that is when the system is most likely to have
    // rewritten the appearance from the device theme.
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') apply()
    })
    return () => subscription.remove()
  }, [theme, colorScheme])
  return (
    <NavigationContainer ref={NavigationRef} theme={theme}>
      {/* Follows the app's theme, not the system one: with a light app on a dark system
          (or vice versa) `auto` painted the status bar the wrong colour and it vanished.
          On Android the navigation bar goes through react-native-edge-to-edge, while the status
          bar is written twice: SystemBars sets the legacy window flags and the effect below sets
          the WindowInsetsController appearance. Once anything touches the new appearance API the
          system ignores the legacy flags, and on a TECNO that left the status bar following the
          device theme instead of the app's, invisible on light screens. */}
      {Platform.OS === 'android' ? (
        <SystemBars style={theme === DarkTheme ? 'light' : 'dark'} />
      ) : (
        <StatusBar animated barStyle={theme === DarkTheme ? 'light-content' : 'dark-content'} />
      )}
      <Stack.Navigator
        initialRouteName={SCREENS.BOTTOM_TAB_NAVIGATOR}
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.backgroundApp,
            elevation: 0,
          },
          headerTintColor: theme.colors.textFirst,
          headerTitleStyle: s.settingsTitle,
          headerTitleAlign: 'center',
          headerShadowVisible: false,
          headerBackTitleVisible: false,
          gestureResponseDistance: 200,
          presentation: Platform.OS === 'android' ? 'transparentModal' : undefined,
          title: '',
          // Same 44 pt touch target as the actions on the right; the stock back button only
          // responds on the glyph and the strip beside it.
          headerLeft: ({ tintColor, canGoBack, onPress }) =>
            canGoBack && onPress ? (
              <View style={s.back}>
                <HeaderIconButton
                  name="arrow-back"
                  color={tintColor ?? theme.colors.textFirst}
                  onPress={onPress}
                />
              </View>
            ) : null,
        }}>
        <Stack.Screen
          name={SCREENS.BOTTOM_TAB_NAVIGATOR}
          component={BottomTabsNavigator}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name={SCREENS.PHOTO_DETAIL}
          component={PhotoDetailScreen}
          options={() => ({
            headerRight: () => (
              <View style={s.icons}>
                <MaterialIcons name={'save-alt'} size={24} color={theme.colors.textThird} />
                <Spacer width={24} />
                <MaterialIcons name="share" size={24} color={theme.colors.textThird} />
              </View>
            ),
          })}
        />
        <Stack.Screen
          name={SCREENS.FULL_SCREEN_IMAGE}
          component={FullScreenImage}
          options={{
            presentation: 'transparentModal',
            cardStyle: { backgroundColor: 'transparent' },
            headerShown: false,
          }}
        />
        <Stack.Screen
          name={SCREENS.COMPARE}
          component={CompareScreen}
          options={{ headerTitle: t('streetView.title') }}
        />
        <Stack.Screen
          name={SCREENS.ABOUT_APP}
          component={AboutAppScreen}
          options={{
            headerTitle: t('settingsMenu.about'),
          }}
        />
        <Stack.Screen
          name={SCREENS.APP_SETTINGS}
          component={AppSettingsScreen}
          options={{
            headerTitle: t('settingsMenu.general'),
          }}
        />
        <Stack.Screen
          name={SCREENS.SUPPORT_CONTACTS}
          component={SupportContactsScreen}
          options={{
            headerTitle: t('settingsMenu.feedback'),
          }}
        />
        <Stack.Screen name={SCREENS.NEWS_POST} component={NewsPostScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
})

const s = StyleSheet.create({
  // 44 pt box around a 24 pt glyph: pull in by 10 so the glyph stays where it was.
  back: { marginLeft: Platform.OS === 'android' ? -5 : 6 },
  icons: { flexDirection: 'row', marginRight: 16 },
  settingsTitle: { fontSize: 17, lineHeight: 28, fontWeight: 'bold' },
})
