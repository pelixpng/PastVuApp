import { createRef, useMemo } from 'react'
import { Platform, Share, useColorScheme } from 'react-native'
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
          options={({ route }) => ({
            headerRight: () => (
              <MaterialIcons
                name="share"
                size={24}
                color={theme.colors.textFirst}
                onPress={() =>
                  Share.share({
                    message: `${route.params.title}: https://pastvu.com/p/${route.params.cid}`,
                  })
                }
                style={s.share}
              />
            ),
          })}
        />
        <Stack.Screen name={SCREENS.ABOUT_APP} component={AboutAppScreen} />
        <Stack.Screen name={SCREENS.APP_SETTINGS} component={AppSettingsScreen} />
        <Stack.Screen name={SCREENS.SUPPORT_CONTACTS} component={SupportContactsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
})

const s = StyleSheet.create({
  back: { marginLeft: Platform.OS === 'android' ? 0 : 16 },
  share: { marginRight: 16 },
})
