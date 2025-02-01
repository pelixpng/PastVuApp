import { useMemo } from 'react'
import { ThemeProvider } from 'styled-components/native'
import { useColorScheme } from 'react-native'
import { DarkTheme, LightTheme } from './src/components/theme/Theme'
import { StatusBar } from 'react-native'
import { MainStackNavigator } from './src/navigation/MainStackNavigator'
import { observer } from 'mobx-react'
import ThemeStore from './src/store/global/Theme.store'

export default observer(function App() {
  const colorScheme = useColorScheme()
  const theme = useMemo(() => {
    const isSystemTheme = ThemeStore.selectedTheme === 'system'
    const isLightTheme =
      ThemeStore.selectedTheme === 'light' || (isSystemTheme && colorScheme === 'light')
    return isLightTheme ? LightTheme : DarkTheme
  }, [ThemeStore.selectedTheme, colorScheme])

  return (
    <ThemeProvider theme={theme}>
      <StatusBar
        animated
        backgroundColor="transparent"
        translucent={true}
        barStyle={theme.names.themeName === 'light' ? 'dark-content' : 'light-content'}
      />
      <MainStackNavigator />
    </ThemeProvider>
  )
})
