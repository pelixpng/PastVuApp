import { createRef, useMemo } from 'react'
import { Platform, useColorScheme, View, StyleSheet } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { observer } from 'mobx-react'
import { StatusBar } from 'expo-status-bar'
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
import { FullScreenImage } from './screens/home/fullScreenImage/FullScreenImage'
import { BottomTabsNavigator } from './navigation/BottomTabsNavigator'
import { PhotoDetailScreen } from './screens/home/photoDetail/PhotoDetail.screen'
import { AboutAppScreen } from './screens/settings/aboutApp/AboutApp.screen'
import { AppSettingsScreen } from './screens/settings/appSettings/AppSettings.screen'
import { SupportContactsScreen } from './screens/settings/supportContacts/SupportContacts.screen'

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
          gestureResponseDistance: 200,
          presentation: Platform.OS === 'android' ? 'transparentModal' : undefined,
          title: '',
          headerBackImage: ({ tintColor }) => (
            <MaterialIcons name={'arrow-back'} size={24} color={tintColor} style={s.back} />
          ),
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
          name={SCREENS.ABOUT_APP}
          component={AboutAppScreen}
          options={{
            headerTitle: 'О приложении',
          }}
        />
        <Stack.Screen
          name={SCREENS.APP_SETTINGS}
          component={AppSettingsScreen}
          options={{
            headerTitle: 'Основные',
          }}
        />
        <Stack.Screen
          name={SCREENS.SUPPORT_CONTACTS}
          component={SupportContactsScreen}
          options={{
            headerTitle: 'Обратная связь',
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
