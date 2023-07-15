import { FC } from 'react'
import { Text, View } from 'react-native'
import { createStackNavigator } from '@react-navigation/stack'
import { SettingsStackParamList } from '../types/Navigation.types'
import { SettingsRoutes } from './Routes'
import { SettingsComponent } from '../screens/Settings'
import { AppInfo } from '../screens/AboutApp'
import { FeedBack } from '../screens/FeedBack'
import { MapSettings } from '../screens/MapSettings'
import { DefaultTheme, useTheme } from 'styled-components'
import { perfectSize } from '../utils/ScreenSize'


const SettingsStack = createStackNavigator<SettingsStackParamList>()


export const SettingsNavigation: FC = () => {
	const theme: DefaultTheme = useTheme()	
  return (
    <SettingsStack.Navigator
			initialRouteName={SettingsRoutes.SettingsComponent}
		>
			<SettingsStack.Screen
				name={SettingsRoutes.SettingsComponent}
				component={SettingsComponent}
				options={{
					title: 'Настройки',
					headerShown: false,
				}}
			/>
			<SettingsStack.Screen
				name={SettingsRoutes.AppInfo}
				component={AppInfo}
				options={{
					title: 'О приложении',
					headerTitleStyle: {
						color: theme.colors.titleMenuText,
						fontSize: perfectSize(25),
						fontStyle: 'normal',
    					fontWeight: '800',
    					lineHeight: perfectSize(25)
					},
					headerTintColor: theme.colors.titleMenuText,
					headerStyle: {
						backgroundColor: theme.colors.backgroundApp,
						elevation: 0
					}
				}}
			/>
			<SettingsStack.Screen
				name={SettingsRoutes.MapSettings}
				component={MapSettings}
				options={{
					title: 'Настройки',
					headerTitleStyle: {
						color: theme.colors.titleMenuText,
						fontSize: perfectSize(25),
						fontStyle: 'normal',
    					fontWeight: '800',
    					lineHeight: perfectSize(25)
					},
					headerTintColor: theme.colors.titleMenuText,
					headerStyle: {
						backgroundColor: theme.colors.backgroundApp,
						elevation: 0
					}
				}}
			/>
			<SettingsStack.Screen
				name={SettingsRoutes.FeedBack}
				component={FeedBack}
				options={{
					title: 'Обратная связь',
					headerTitleStyle: {
						color: theme.colors.titleMenuText,
						fontSize: perfectSize(25),
						fontStyle: 'normal',
    					fontWeight: '800',
    					lineHeight: perfectSize(25)
					},
					headerTintColor: theme.colors.titleMenuText,
					headerStyle: {
						backgroundColor: theme.colors.backgroundApp,
						elevation: 0
					}
				}}
				
			/>
		</SettingsStack.Navigator>
  )
}

