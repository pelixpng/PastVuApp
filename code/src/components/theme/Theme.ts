import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  Theme,
} from '@react-navigation/native'
import { MapDark, MapLight } from './GoogleMapStyle'

export interface CustomTheme extends Theme {
  colors: Theme['colors'] & {
    backgroundApp: string
    textThird: string
    textSecond: string
    textFirst: string
    baseSecond: string
    baseThird: string
    basePrimary: string
    baseFourth: string
    MapTheme: any
    markerBorder: string
  }
  names: {
    themeName: 'light' | 'dark'
  }
}

export const LightTheme: CustomTheme = {
  ...NavigationDefaultTheme,
  colors: {
    ...NavigationDefaultTheme.colors,
    backgroundApp: '#FFFFFF',
    textThird: '#A4A5B1',
    textSecond: '#686A7C',
    textFirst: '#2E3143',
    baseSecond: '#FFFFFF',
    baseThird: '#EDEDED',
    basePrimary: '#428BF9',
    baseFourth: '#EDEDED',
    MapTheme: MapLight,
    markerBorder: 'rgba(0, 0, 0, 0.20)',
  },
  names: {
    themeName: 'light',
  },
}

export const DarkTheme: CustomTheme = {
  ...NavigationDarkTheme,
  colors: {
    ...NavigationDarkTheme.colors,
    backgroundApp: '#121212',
    textThird: '#A0A0A0',
    textSecond: '#C1C1C1',
    textFirst: '#FFFFFF',
    baseSecond: '#202020',
    baseThird: '#232325',
    basePrimary: '#428BF9',
    baseFourth: '#444444',
    MapTheme: MapDark,
    markerBorder: 'rgba(0, 0, 0, 0.50)',
  },
  names: {
    themeName: 'dark',
  },
}
