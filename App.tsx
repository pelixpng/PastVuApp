import React, { useEffect, useState } from 'react';
import { MapComponent } from './screens/MapView';
import { StartNavigator } from './navigation/StartNavigation';
import { BottomNavigator } from './navigation/BottomNavigation';
import { DefaultTheme, ThemeProvider, useTheme } from 'styled-components/native'
import { useColorScheme } from 'react-native';
import { DarkTheme, LightTheme } from './components/Theme';
import { useFonts } from 'expo-font';

export default function App() {
  const colorScheme = useColorScheme()
  // const [loaded] = useFonts({
  //   Montserrat: require('./assets/fonts/DancingScript-VariableFont_wght.ttf'),
  // });

  // if (!loaded) {
  //   return null;
  // }
  return (
    // <MapComponent/>
    <ThemeProvider
			theme={
				LightTheme
			}
		>
      <StartNavigator/>
    </ThemeProvider>
  );
}
