import { NavigationContainer } from '@react-navigation/native'
import { RootStackParamList } from '../types/navigation'
import { createStackNavigator } from '@react-navigation/stack'
import { PhotoPage } from '../screens/map/PhotoView'
import { BottomNavigator } from './BottomNavigation'
import { DefaultTheme, useTheme } from 'styled-components'
import { History } from '../screens/map/History'
import { StartScreen } from '../screens/map/StartScreen'
import { mmkv } from '../storage/Storage'
import { MaterialIcons } from '@expo/vector-icons'
import { perfectSize } from '../utils/ScreenSize'
import { Platform } from 'react-native'
import { SettingsComponent } from '../screens/settings/Settings'
import { AppInfo } from '../screens/settings/AboutApp'
import { FeedBack } from '../screens/settings/FeedBack'
import { MapSettings } from '../screens/settings/MapSettings'

const Stack = createStackNavigator<RootStackParamList>()

export function StartNavigator() {
  const theme: DefaultTheme = useTheme()
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={
          Platform.OS === 'android'
            ? mmkv.getAllKeys().length
              ? 'MapComponent'
              : 'StartScreen'
            : 'MapComponent'
        }
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.backgroundApp,
            elevation: 0,
          },
          headerTintColor: theme.colors.titleMenuText,
          headerShadowVisible: false,
          headerBackTitle: 'Назад',
          gestureResponseDistance: 200,
          presentation: Platform.OS === 'android' ? 'transparentModal' : undefined,
          title: '',
          headerBackImage: ({ tintColor }) => (
            <MaterialIcons name={'arrow-back-ios-new'} size={perfectSize(20)} color={tintColor} />
          ),
        }}>
        <Stack.Screen
          name={'MapComponent'}
          component={BottomNavigator}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen name={'PhotoPage'} component={PhotoPage} />
        <Stack.Screen name={'History'} component={History} />
        <Stack.Screen name={'StartScreen'} component={StartScreen} />
        <Stack.Screen
          name={'SettingsComponent'}
          component={SettingsComponent}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen name={'AppInfo'} component={AppInfo} />
        <Stack.Screen name={'MapSettings'} component={MapSettings} />
        <Stack.Screen name={'FeedBack'} component={FeedBack} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
