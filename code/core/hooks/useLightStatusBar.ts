import { useCallback } from 'react'
import { AppState, Platform, StatusBar } from 'react-native'
import { useFocusEffect, useTheme } from '@react-navigation/native'
import { SystemBars } from 'react-native-edge-to-edge'

/**
 * White status bar icons while the screen is focused, whatever the app's theme: the full-screen
 * photo sits on black, where the light theme's dark icons disappear. Losing focus hands the bar
 * back to the theme as soon as the screen starts closing, not once its card has finished leaving.
 *
 * On iOS the root StatusBar's entry stays underneath and comes back by itself. Android needs both
 * writes the root makes (see AppMobile): SystemBars for the legacy window flags, and
 * StatusBar.setBarStyle for the WindowInsetsController appearance. The root rewrites the latter
 * on every return to the foreground, so this does too, after it.
 */
export const useLightStatusBar = () => {
  const { names } = useTheme()
  const themeBarStyle = names.themeName === 'dark' ? 'light-content' : 'dark-content'

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'android') {
        const entry = StatusBar.pushStackEntry({ barStyle: 'light-content', animated: true })
        return () => StatusBar.popStackEntry(entry)
      }
      const entry = SystemBars.pushStackEntry({ style: { statusBar: 'light' } })
      const apply = () => StatusBar.setBarStyle('light-content', true)
      apply()
      const subscription = AppState.addEventListener('change', state => {
        if (state === 'active') apply()
      })
      return () => {
        subscription.remove()
        SystemBars.popStackEntry(entry)
        StatusBar.setBarStyle(themeBarStyle, true)
      }
    }, [themeBarStyle]),
  )
}
