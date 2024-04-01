import { DefaultTheme } from 'styled-components'
import { MapDark, MapLigth } from './GoogleMapStyle'

export const LightTheme: DefaultTheme = {
  colors: {
    backgroundApp: 'white',
    tabBarActiveTint: 'rgba(94, 157, 250, 0.90)',
    tabBarInactiveTintColor: 'rgba(199, 202, 207, 0.9)',
    titleMenuText: 'rgba(25, 28, 48, 0.90)',
    MenuDescriptionText: 'rgba(27, 31, 59, 0.65)',
    BackgroundMenuIcon: '#438BF9',
    MenuContainer: 'white',
    SliderRangeBG: '#EDEDED',
    MapTheme: MapLigth,
    markerBorder: 0.2,
  },
  names: {
    themeName: 'light',
  },
}

export const DarkTheme: DefaultTheme = {
  colors: {
    backgroundApp: '#121212',
    tabBarActiveTint: 'rgba(59, 120, 213, 1)',
    tabBarInactiveTintColor: 'rgba(125, 132, 140, 1)',
    titleMenuText: 'white',
    MenuDescriptionText: 'rgba(255, 255, 255, 0.72)',
    BackgroundMenuIcon: '#438BF9',
    MenuContainer: '#1C1C1E',
    SliderRangeBG: '#232325',
    MapTheme: MapDark,
    markerBorder: 0.5,
  },
  names: {
    themeName: 'dark',
  },
}
