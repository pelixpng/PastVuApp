import * as React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { RootStackParamList } from '../types/Navigation'
import { createStackNavigator } from '@react-navigation/stack'
import { NetInfoState, useNetInfo } from '@react-native-community/netinfo'
import { StartRoutes } from './Routes'
import { ErrorLoad } from '../screens/Error'
import { PhotoPage } from '../screens/PhotoView'
import { BottomNavigator } from './BottomNavigation'
import { DefaultTheme, useTheme } from 'styled-components'

const Stack = createStackNavigator<RootStackParamList>()

export function StartNavigator() {
	const internetState: NetInfoState = useNetInfo()
	const theme: DefaultTheme = useTheme()
	return (
		<NavigationContainer>
			<Stack.Navigator
				initialRouteName={
					internetState.isConnected
						? StartRoutes.ErrorLoad
						: StartRoutes.MapComponent
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
					name={StartRoutes.MapComponent}
					component={BottomNavigator}
					options={{
						headerShown: false
					}}
				/>
				<Stack.Screen name={StartRoutes.ErrorLoad} component={ErrorLoad} />
				<Stack.Screen
					name={StartRoutes.PhotoPage}
					component={PhotoPage}
					options={{
						title: ''
					}}
				/>
			</Stack.Navigator>
		</NavigationContainer>
	)
}
