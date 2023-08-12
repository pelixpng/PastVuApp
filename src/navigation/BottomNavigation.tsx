import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { MapComponent } from '../screens/MapView'
import { BottomRoutes } from './Routes'
import { SettingsNavigation } from './SettingsNavigation'
import { DefaultTheme, useTheme } from 'styled-components'
import { perfectSize } from '../utils/ScreenSize'
import { Feather } from '@expo/vector-icons'
import React from 'react'
const Tab = createBottomTabNavigator()

export function BottomNavigator() {
	const theme: DefaultTheme = useTheme()
	return (
		<Tab.Navigator
			screenOptions={{
				tabBarActiveTintColor: theme.colors.tabBarActiveTint,
				tabBarInactiveTintColor: theme.colors.tabBarInactiveTintColor,

				tabBarStyle: {
					backgroundColor: theme.colors.backgroundApp,
					paddingTop: perfectSize(5),
					paddingBottom: perfectSize(5),
					borderTopWidth: 0,
					height: perfectSize(60)

					//сделать высоту свою
				}
			}}
		>
			<Tab.Screen
				name={BottomRoutes.MapComponent}
				component={MapComponent}
				options={{
					headerShown: false,
					tabBarShowLabel: true,
					title: 'Карта',
					tabBarLabelStyle: {
						fontSize: perfectSize(13),
						fontStyle: 'normal',
						fontWeight: '500',
						lineHeight: perfectSize(12)
					},
					tabBarIcon: ({ color }) => (
						<Feather name="map" size={perfectSize(24)} color={color} />
					)
				}}
			/>
			<Tab.Screen
				name={BottomRoutes.SettingsComponent}
				component={SettingsNavigation}
				options={{
					headerShown: false,
					tabBarShowLabel: true,
					title: 'Настройки',
					tabBarLabelStyle: {
						fontSize: perfectSize(13),
						fontStyle: 'normal',
						fontWeight: '500',
						lineHeight: perfectSize(12)
					},
					tabBarIcon: ({ color }) => (
						<Feather name="settings" size={perfectSize(24)} color={color} />
					)
				}}
			/>
		</Tab.Navigator>
	)
}
