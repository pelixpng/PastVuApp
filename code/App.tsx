import React, { useEffect } from 'react'
import { StartNavigator } from './src/navigation/StartNavigation'
import { ThemeProvider } from 'styled-components/native'
import { useColorScheme } from 'react-native'
import { DarkTheme, LightTheme } from './src/components/theme/Theme'
import { observer } from 'mobx-react-lite'
import { StatusBar, StatusBarStyle } from 'expo-status-bar'
import ThemeStore from './src/mobx/ThemeStore'

const statusBarConst: { [key: string]: StatusBarStyle } = {
	Светлая: 'dark',
	Тёмная: 'light',
	Системная: 'auto'
}

export default observer(function App() {
	const colorScheme = useColorScheme()
	const { themeSettings, themeSettingsTitle, changeSettingsTheme } = ThemeStore
	useEffect(() => {
		if (themeSettingsTitle === 'Системная') {
			switch (colorScheme) {
				case 'light':
					changeSettingsTheme(LightTheme)
					break
				case 'dark':
					changeSettingsTheme(DarkTheme)
					break
				default:
					changeSettingsTheme(LightTheme)
					break
			}
		}
	}, [colorScheme, themeSettingsTitle])
	return (
		<ThemeProvider theme={themeSettings}>
			<StatusBar
				backgroundColor={themeSettings.colors.backgroundApp}
				style={statusBarConst[themeSettingsTitle]}
			/>
			<StartNavigator />
		</ThemeProvider>
	)
})
