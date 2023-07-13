import { FC } from 'react'
import { Text, View } from 'react-native'
import { createStackNavigator } from '@react-navigation/stack'
import { SettingsStackParamList } from '../types/Navigation.types'
import { SettingsRoutes } from './Routes'
import { SettingsComponent } from '../screens/Settings'
import { AppInfo } from '../screens/AboutApp'
import { ChangeTheme } from '../screens/ChangeTheme'
import { FeedBack } from '../screens/FeedBack'


const SettingsStack = createStackNavigator<SettingsStackParamList>()


export const SettingsNavigation: FC = () => {
  return (
    <SettingsStack.Navigator
			initialRouteName={SettingsRoutes.SettingsComponent}
		>
			<SettingsStack.Screen
				name={SettingsRoutes.SettingsComponent}
				component={SettingsComponent}
				options={{
					title: 'Настройки',
					headerShown: false
				}}
			/>
			<SettingsStack.Screen
				name={SettingsRoutes.AppInfo}
				component={AppInfo}
				options={{
					title: ''
				}}
			/>
			<SettingsStack.Screen
				name={SettingsRoutes.ChangeTheme}
				component={ChangeTheme}
				options={{
					title: ''
				}}
			/>
			<SettingsStack.Screen
				name={SettingsRoutes.FeedBack}
				component={FeedBack}
				options={{
					title: ''
				}}
			/>
		</SettingsStack.Navigator>
  )
}

