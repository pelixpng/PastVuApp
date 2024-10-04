import { NavigationContainer } from '@react-navigation/native'
import { RootStackParamList } from '../types/navigation'
import { createStackNavigator } from '@react-navigation/stack'
import { PhotoPage } from '../screens/map/PhotoView'
import { BottomNavigator } from './BottomNavigation'
import { DefaultTheme, useTheme } from 'styled-components'
import { History } from '../screens/map/History'
import { MaterialIcons } from '@expo/vector-icons'
import { Platform, StyleSheet } from 'react-native'
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
        initialRouteName={'MapComponent'}
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
          name={'MapComponent'}
          component={BottomNavigator}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen name={'PhotoPage'} component={PhotoPage} />
        <Stack.Screen name={'History'} component={History} />
        <Stack.Screen name={'SettingsComponent'} component={SettingsComponent} />
        <Stack.Screen name={'AppInfo'} component={AppInfo} />
        <Stack.Screen name={'MapSettings'} component={MapSettings} />
        <Stack.Screen name={'FeedBack'} component={FeedBack} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

const s = StyleSheet.create({
  back: { marginLeft: Platform.OS === 'android' ? 0 : 16 },
})
