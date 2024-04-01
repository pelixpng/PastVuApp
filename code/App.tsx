import React, { useEffect } from 'react'
import { StartNavigator } from './src/navigation/StartNavigation'
import { ThemeProvider } from 'styled-components/native'
import { useColorScheme } from 'react-native'
import { DarkTheme, LightTheme } from './src/components/theme/Theme'
import { observer } from 'mobx-react-lite'
import ThemeStore from './src/mobx/ThemeStore'
import { StatusBar } from 'react-native'

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
        animated
        backgroundColor="transparent"
        translucent={true}
        barStyle={themeSettings.names.themeName === 'light' ? 'dark-content' : 'light-content'}
      />
      <StartNavigator />
    </ThemeProvider>
  )
})
