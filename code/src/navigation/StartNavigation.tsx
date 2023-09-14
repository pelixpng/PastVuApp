import * as React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { RootStackParamList } from '../types/Navigation'
import { createStackNavigator } from '@react-navigation/stack'
import { NetInfoState, useNetInfo } from '@react-native-community/netinfo'
import { ErrorLoad } from '../screens/map/Error'
import { PhotoPage } from '../screens/map/PhotoView'
import { BottomNavigator } from './BottomNavigation'
import { DefaultTheme, useTheme } from 'styled-components'
import { useMemo } from 'react'
import AlertModalService from '../utils/AlertModalService'

const Stack = createStackNavigator<RootStackParamList>()

export function StartNavigator() {
	const internetState: NetInfoState = useNetInfo()
	const theme: DefaultTheme = useTheme()

	useMemo(() => {
		internetState.isConnected === false && AlertModalService.internetError()
	}, [internetState])
	return (
		<NavigationContainer>
			<Stack.Navigator
				initialRouteName={
					internetState.isConnected ? 'ErrorLoad' : 'MapComponent'
				}
				screenOptions={{
					headerStyle: {
						backgroundColor: theme.colors.backgroundApp,
						elevation: 0
					},
					headerTintColor: theme.colors.titleMenuText,
					presentation: 'transparentModal'
				}}
			>
				<Stack.Screen
					name={'MapComponent'}
					component={BottomNavigator}
					options={{
						headerShown: false
					}}
				/>
				<Stack.Screen name={'ErrorLoad'} component={ErrorLoad} />
				<Stack.Screen
					name={'PhotoPage'}
					component={PhotoPage}
					options={{
						title: ''
					}}
				/>
			</Stack.Navigator>
		</NavigationContainer>
	)
}
