import { createRef, useMemo } from 'react'
import { Platform, useColorScheme, View } from 'react-native'
import { DarkTheme, LightTheme } from './src/components/theme/Theme'
import { StatusBar, StyleSheet } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { observer } from 'mobx-react'
import ThemeStore from './src/store/global/Theme.store'
import { createStackNavigator } from '@react-navigation/stack'
import { StackParamList } from './src/navigation/stackParams.types'
import {
  NavigationContainer,
  NavigationContainerRef,
  ParamListBase,
} from '@react-navigation/native'
import { SCREENS } from './src/navigation/navigation.types'
import { BottomTabsNavigator } from './src/navigation/BottomTabsNavigator'
import { PhotoDetailScreen } from './src/screens/home/photoDetail/PhotoDetail.screen'
import { AboutAppScreen } from './src/screens/settings/aboutApp/AboutApp.screen'
import { AppSettingsScreen } from './src/screens/settings/appSettings/AppSettings.screen'
import { SupportContactsScreen } from './src/screens/settings/supportContacts/SupportContacts.screen'
import { Spacer } from './src/components/ui/Spacer'
import { FullScreenImage } from './src/screens/home/fullScreenImage/FullScreenImage'

export const Stack = createStackNavigator<StackParamList>()
export let NavigationRef = createRef<NavigationContainerRef<ParamListBase>>()

export default observer(function App() {
  const colorScheme = useColorScheme()
  const theme = useMemo(() => {
    const isSystemTheme = ThemeStore.selectedTheme === 'system'
    const isLightTheme =
      ThemeStore.selectedTheme === 'light' || (isSystemTheme && colorScheme === 'light')
    return isLightTheme ? LightTheme : DarkTheme
  }, [ThemeStore.selectedTheme, colorScheme])
  return (
    <NavigationContainer ref={NavigationRef} theme={theme}>
      <StatusBar
        animated
        backgroundColor="transparent"
        translucent={true}
        barStyle={theme.names.themeName === 'light' ? 'dark-content' : 'light-content'}
      />
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
