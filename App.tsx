import React, { useEffect, useState } from 'react';
import { MapComponent } from './screens/MapView';
import { StartNavigator } from './navigation/StartNavigation';
import { BottomNavigator } from './navigation/BottomNavigation';
import { DefaultTheme, ThemeProvider, useTheme } from 'styled-components/native'
import { useColorScheme } from 'react-native';
import { DarkTheme, LightTheme } from './components/Theme';
import { useFonts } from 'expo-font';
import { Storage } from './Storage/Storage';
import apiStore from './mobxStore/apiStore';
import { observer } from 'mobx-react-lite';

export default observer(function App() {
  const colorScheme = useColorScheme()
  const {themeSettings, theme, changeThemeSettings, changeTheme} = apiStore;
  
  const getColorScheme = () => {
		const SavethemeSettings = Storage.getString('theme')
		if (SavethemeSettings == 'Тёмная') {
      changeThemeSettings(SavethemeSettings)
      changeTheme('dark')
			// dispatch(addThemeSettingsToRedux(themeSettings))
			// dispatch(addThemeToRedux('dark'))
		} else if (SavethemeSettings == 'Светлая') {
      changeThemeSettings(SavethemeSettings)
      changeTheme('light')
			// dispatch(addThemeSettingsToRedux(themeSettings))
			// dispatch(addThemeToRedux('light'))
		} else {
			changeThemeSettings('Системная')
			if (colorScheme != null && colorScheme != undefined) {
        changeTheme(colorScheme)
				//dispatch(addThemeToRedux(colorScheme))
			} else {
        changeTheme('light')
				//dispatch(addThemeToRedux('light'))
			}
		}
	}

  const getTheme = (theme: string) => {
		if (theme == 'light') {
			return LightTheme
		} else {
			return DarkTheme
		}
	}

  getColorScheme()
  
  return (
    <ThemeProvider
			theme={
				themeSettings == 'Системная' ? getTheme(colorScheme) : getTheme(theme)
			}
      //theme={DarkTheme}
		>
      <StartNavigator/>
    </ThemeProvider>
  );
})
