import React, { useEffect, useState } from 'react'
import { MapComponent } from './screens/MapView'
import { StartNavigator } from './navigation/StartNavigation'
import { BottomNavigator } from './navigation/BottomNavigation'
import { DefaultTheme, ThemeProvider, useTheme } from 'styled-components/native'
import { useColorScheme } from 'react-native'
import { DarkTheme, LightTheme } from './components/Theme'
import { useFonts } from 'expo-font'
import StorageServiceMMKV, { Storage } from './Storage/Storage'
import apiStore from './mobxStore/apiStore'
import { observer } from 'mobx-react-lite'
import { StatusBar } from 'expo-status-bar'

//ПОМЕНЯТЬ ТЕЛЕГУ ССЫЛКУ
export default observer(function App() {
	const colorScheme = useColorScheme()
	const { themeSettings, theme, changeTheme } = apiStore

	useEffect(() => {
		getColorScheme()
	}, [])

	const getColorScheme = () => {
		let selectedTheme = ''
		if (themeSettings === 'Тёмная') {
			selectedTheme = 'dark'
		} else if (themeSettings === 'Светлая') {
			selectedTheme = 'light'
		} else {
			selectedTheme = colorScheme || 'light'
		}
		changeTheme(selectedTheme)
	}

	const getTheme = (theme: string | null | undefined) => {
		if (theme == 'Светлая' || theme == 'light') {
			return LightTheme
		} else {
			return DarkTheme
		}
	}

	return (
		<ThemeProvider
			theme={
				themeSettings == 'Системная' ? getTheme(colorScheme) : getTheme(theme)
			}
		>
			<StatusBar
				backgroundColor={
					themeSettings == 'Системная'
						? getTheme(colorScheme).colors.backgroundApp
						: getTheme(theme).colors.backgroundApp
				}
				style="auto"
			/>

			<StartNavigator />
		</ThemeProvider>
	)
})
