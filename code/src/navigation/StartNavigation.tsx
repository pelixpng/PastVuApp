import * as React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { RootStackParamList } from '../types/navigation'
import { createStackNavigator } from '@react-navigation/stack'
import { NetInfoState, useNetInfo } from '@react-native-community/netinfo'
import { ErrorLoad } from '../screens/map/Error'
import { PhotoPage } from '../screens/map/PhotoView'
import { BottomNavigator } from './BottomNavigation'
import { DefaultTheme, useTheme } from 'styled-components'
import { useMemo } from 'react'
import AlertModalService from '../utils/AlertModalService'
import { History } from '../screens/map/History'

const Stack = createStackNavigator<RootStackParamList>()

export function StartNavigator() {
	const internetState: NetInfoState = useNetInfo()
	const theme: DefaultTheme = useTheme()
	useMemo(() => {
		internetState.isConnected === false &&
			AlertModalService.infoAlert('Ошибка', 'Нет подключения к интернету')
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
				<Stack.Screen name={'ErrorLoad'} component={ErrorLoad} />
				<Stack.Screen name={'PhotoPage'} component={PhotoPage} />
				<Stack.Screen name={'History'} component={History} />
			</Stack.Navigator>
		</NavigationContainer>
	)
}
