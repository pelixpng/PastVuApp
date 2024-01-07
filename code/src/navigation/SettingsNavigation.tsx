import React, { FC } from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { SettingsStackParamList } from '../types/navigation'
import { SettingsComponent } from '../screens/settings/Settings'
import { AppInfo } from '../screens/settings/AboutApp'
import { FeedBack } from '../screens/settings/FeedBack'
import { MapSettings } from '../screens/settings/MapSettings'
import { DefaultTheme, useTheme } from 'styled-components'
import { perfectSize } from '../utils/ScreenSize'

const SettingsStack = createStackNavigator<SettingsStackParamList>()

export const SettingsNavigation: FC = () => {
	const theme: DefaultTheme = useTheme()
	return (
		<SettingsStack.Navigator
			initialRouteName={'SettingsComponent'}
			screenOptions={{
				headerStyle: {
					backgroundColor: theme.colors.backgroundApp,
					elevation: 0
				},
				headerTitleStyle: {
					color: theme.colors.titleMenuText,
					fontSize: perfectSize(25),
					fontStyle: 'normal',
					fontWeight: '800',
					lineHeight: perfectSize(25)
				},
				headerTintColor: theme.colors.titleMenuText,
				presentation: 'transparentModal'
			}}
		>
			<SettingsStack.Screen
				name={'SettingsComponent'}
				component={SettingsComponent}
				options={{
					headerShown: false
				}}
			/>
			<SettingsStack.Screen
				name={'AppInfo'}
				component={AppInfo}
				options={{
					title: 'О приложении'
				}}
			/>
			<SettingsStack.Screen
				name={'MapSettings'}
				component={MapSettings}
				options={{
					title: 'Настройки'
				}}
			/>
			<SettingsStack.Screen
				name={'FeedBack'}
				component={FeedBack}
				options={{
					title: 'Обратная связь'
				}}
			/>
		</SettingsStack.Navigator>
	)
}
