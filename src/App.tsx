import React from 'react'
import { StartNavigator } from './navigation/StartNavigation'
import { ThemeProvider } from 'styled-components/native'
import { useColorScheme } from 'react-native'
import { DarkTheme, LightTheme } from './components/theme/Theme'
import { observer } from 'mobx-react-lite'
import { StatusBar } from 'expo-status-bar'
import ThemeStore from './mobx/ThemeStore'

export default observer(function App() {
	const colorScheme = useColorScheme()
	const { themeSettings, theme, changeTheme } = ThemeStore

	const getColorScheme = () => {
		const selectedTheme =
			themeSettings === 'Тёмная'
				? 'dark'
				: themeSettings === 'Светлая'
				? 'light'
				: colorScheme || 'light'
		changeTheme(selectedTheme)
	}

	const getTheme = (theme: string | null | undefined) => {
		return theme === 'Светлая' || theme === 'light' ? LightTheme : DarkTheme
	}

	getColorScheme()
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
