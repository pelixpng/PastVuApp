import {
  NavigationContainer,
  NavigationContainerRef,
  ParamListBase,
} from '@react-navigation/native'
import { DefaultTheme, useTheme } from 'styled-components'
import { MaterialIcons } from '@expo/vector-icons'
import { Platform, Share, StyleSheet } from 'react-native'
import { AppSettingsScreen } from '../screens/settings/appSettings/AppSettings.screen'
import { SCREENS } from './navigation.types'
import { createRef } from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { StackParamList } from './stackParams.types'
import { BottomTabsNavigator } from './BottomTabsNavigator'
import { PhotoDetailScreen } from '../screens/home/photoDetail/PhotoDetail.screen'
import { AboutAppScreen } from '../screens/settings/aboutApp/AboutApp.screen'
import { SupportContactsScreen } from '../screens/settings/supportContacts/SupportContacts.screen'

export const Stack = createStackNavigator<StackParamList>()
export let NavigationRef = createRef<NavigationContainerRef<ParamListBase>>()

export function MainStackNavigator() {
  const theme: DefaultTheme = useTheme()
  return (
    <NavigationContainer ref={NavigationRef}>
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
                onPress={() =>
                  Share.share({
                    message: `${route.params.title}: https://pastvu.com/p/${route.params.cid}`,
                  })
                }
                color={theme.colors.textFirst}
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
}

const s = StyleSheet.create({
  back: { marginLeft: Platform.OS === 'android' ? 0 : 16 },
  share: { marginRight: 16 },
})
