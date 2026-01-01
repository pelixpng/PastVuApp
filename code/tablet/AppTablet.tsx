import { Platform, useColorScheme, StyleSheet } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { createRef, useMemo } from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import {
  NavigationContainer,
  NavigationContainerRef,
  ParamListBase,
} from '@react-navigation/native'
import { observer } from 'mobx-react'
import { DarkTheme, LightTheme } from '../core/components/theme/Theme'
import ThemeStore from '../core/store/Theme.store'
import { StackParamList } from './navigation/stackParams.types'
import { SCREENS } from './navigation/navigation.types'
import { BottomTabsNavigator } from './navigation/BottomTabsNavigator'
import { FullScreenImage } from './screen/fullScreenImage/FullScreenImage'

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
  return (
    <NavigationContainer ref={NavigationRef} theme={theme}>
      <StatusBar animated style={'auto'} />
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
      </Stack.Navigator>
    </NavigationContainer>
  )
})

const s = StyleSheet.create({
  back: { marginLeft: Platform.OS === 'android' ? 5 : 16 },
  icons: { flexDirection: 'row', marginRight: 16 },
  settingsTitle: { fontSize: 17, lineHeight: 28, fontWeight: 'bold' },
})
