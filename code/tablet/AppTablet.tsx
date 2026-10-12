import { AppState, Platform, StatusBar, useColorScheme, StyleSheet, View } from 'react-native'
import { SystemBars } from 'react-native-edge-to-edge'
import { createRef, useEffect, useMemo } from 'react'
import {
  CardStyleInterpolators,
  HeaderStyleInterpolators,
  createStackNavigator,
} from '@react-navigation/stack'
import {
  NavigationContainer,
  NavigationContainerRef,
  ParamListBase,
} from '@react-navigation/native'
import { observer } from 'mobx-react-lite'
import { DarkTheme, LightTheme } from '../core/components/theme/Theme'
import ThemeStore from '../core/store/Theme.store'
import { StackParamList } from './navigation/stackParams.types'
import { SCREENS } from './navigation/navigation.types'
import { BottomTabsNavigator } from './navigation/BottomTabsNavigator'
import { FullScreenImage } from './screen/fullScreenImage/FullScreenImage'
import { ProfileScreen } from './screen/profile/Profile.screen'
import { HeaderIconButton } from '../core/components/ui/buttons/HeaderIconButton'
import { t } from '../core/i18n'
import { ModelDownloadSheet } from '../core/components/colorize/ModelDownloadSheet'

const Stack = createStackNavigator<StackParamList>()
export let NavigationRef = createRef<NavigationContainerRef<ParamListBase>>()

export default observer(function AppTablet() {
  const colorScheme = useColorScheme()
  const theme = useMemo(() => {
    const isSystemTheme = ThemeStore.selectedTheme === 'system'
    const isLightTheme =
      ThemeStore.selectedTheme === 'light' || (isSystemTheme && colorScheme === 'light')
    return isLightTheme ? LightTheme : DarkTheme
  }, [ThemeStore.selectedTheme, colorScheme])
  useEffect(() => {
    if (Platform.OS !== 'android') return
    // See AppMobile: the status bar is written through the WindowInsetsController appearance
    // as well, since the legacy flags SystemBars sets get ignored once that API has been touched.
    const apply = () =>
      StatusBar.setBarStyle(theme === DarkTheme ? 'light-content' : 'dark-content', true)
    apply()
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') apply()
    })
    return () => subscription.remove()
  }, [theme, colorScheme])
  return (
    <NavigationContainer ref={NavigationRef} theme={theme}>
      {/* Follows the app's theme, not the system one: with a light app on a dark system
          (or vice versa) `auto` painted the status bar the wrong colour and it vanished.
          Android runs edge-to-edge, where React Native's StatusBar ignores style changes, so the
          system bars are driven through react-native-edge-to-edge there. */}
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
          headerShown: false,
          gestureResponseDistance: 200,
          presentation: Platform.OS === 'android' ? 'transparentModal' : undefined,
          title: '',
        }}>
        <Stack.Screen name={SCREENS.BOTTOM_TAB_NAVIGATOR} component={BottomTabsNavigator} />
        <Stack.Screen
          name={SCREENS.FULL_SCREEN_IMAGE}
          component={FullScreenImage}
          options={{
            presentation: 'transparentModal',
            cardStyle: { backgroundColor: 'transparent' },
          }}
        />
        <Stack.Screen
          name={SCREENS.PROFILE}
          component={ProfileScreen}
          options={{
            headerShown: true,
            headerTitle: t('profile.title'),
            headerLeft: ({ tintColor, onPress }) =>
              onPress ? (
                <View style={s.profileBack}>
                  <HeaderIconButton
                    name="arrow-back"
                    color={tintColor ?? theme.colors.textFirst}
                    onPress={onPress}
                  />
                </View>
              ) : null,
            // Stays attached underneath, like every other screen here: detaching the tabs would
            // tear the native map out and rebuild it on return.
            presentation: 'transparentModal',
            // A fade, not a slide: the profile covers the map from its first frame and never
            // moves, so the map cannot show through it on Android (see ProfileScreen).
            cardStyleInterpolator: CardStyleInterpolators.forFadeFromCenter,
            headerStyleInterpolator: HeaderStyleInterpolators.forFade,
            gestureEnabled: false,
          }}
        />
      </Stack.Navigator>
      {/* The colorization model's one-time download, opened by the palette. */}
      <ModelDownloadSheet />
    </NavigationContainer>
  )
})

const s = StyleSheet.create({
  back: { marginLeft: Platform.OS === 'android' ? 5 : 16 },
  icons: { flexDirection: 'row', marginRight: 16 },
  settingsTitle: { fontSize: 17, lineHeight: 28, fontWeight: 'bold' },
  // 44 pt button around a 24 pt glyph: 6 keeps the glyph 16 from the edge.
  profileBack: { marginLeft: 6 },
})
