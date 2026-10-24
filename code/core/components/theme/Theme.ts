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
    selectedItem: string
    basePrimary: string
    baseFourth: string
    baseFifth: string
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
    baseFifth: '#F6F6F6',
    selectedItem: '#E8F1FF',
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
    // Dark greys rather than pure black. react-navigation fills screens with background and its
    // stock headers and tab bars with card, and its dark defaults are near-black, so both are set.
    background: '#1C1C1E',
    card: '#1C1C1E',
    border: '#3A3A3C',
    backgroundApp: '#1C1C1E',
    textThird: '#A0A0A0',
    textSecond: '#C1C1C1',
    textFirst: '#FFFFFF',
    baseSecond: '#2C2C2E',
    baseThird: '#3A3A3C',
    basePrimary: '#428BF9',
    baseFourth: '#48484A',
    baseFifth: '#2C2C2E',
    selectedItem: '#2C2C2E',
    MapTheme: MapDark,
    markerBorder: 'rgba(0, 0, 0, 0.50)',
  },
  names: {
    themeName: 'dark',
  },
}
