import * as React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { RootStackParamList } from '../types/navigation'
import { createStackNavigator } from '@react-navigation/stack'
import { PhotoPage } from '../screens/map/PhotoView'
import { BottomNavigator } from './BottomNavigation'
import { DefaultTheme, useTheme } from 'styled-components'
import { History } from '../screens/map/History'
import { StartScreen } from '../screens/map/StartScreen'
import { Storage } from '../storage/Storage'

const Stack = createStackNavigator<RootStackParamList>()

export function StartNavigator() {
	const theme: DefaultTheme = useTheme()
	return (
		<NavigationContainer>
			<Stack.Navigator
				initialRouteName={
					Storage.getBoolean('launchStatus') ? 'MapComponent' : 'StartScreen'
				}
				screenOptions={{
					headerStyle: {
						backgroundColor: theme.colors.backgroundApp,
						elevation: 0
					},
					headerTintColor: theme.colors.titleMenuText,
					presentation: 'transparentModal',
					title: ''
				}}
			>
				<Stack.Screen
					name={'MapComponent'}
					component={BottomNavigator}
					options={{
						headerShown: false
					}}
				/>
				<Stack.Screen name={'PhotoPage'} component={PhotoPage} />
				<Stack.Screen name={'History'} component={History} />
				<Stack.Screen name={'StartScreen'} component={StartScreen} />
			</Stack.Navigator>
		</NavigationContainer>
	)
}
