import { DefaultTheme } from 'styled-components'
import { MapDark, MapLigth } from './GoogleMapStyle'

export const LightTheme: DefaultTheme = {
  colors: {
    backgroundApp: '#FFFFFF',
    textThird: '#A4A5B1',
    textSecond: '#686A7C',
    textFirst: '#2E3143',
    baseSecond: '#FFFFFF',
    baseThird: '#EDEDED',
    basePrimary: '#428BF9',
    baseFourth: '#EDEDED',
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
    textThird: '#A0A0A0',
    textSecond: '#C1C1C1',
    textFirst: '#FFFFFF',
    baseSecond: '#202020',
    baseThird: '#232325',
    basePrimary: '#428BF9',
    baseFourth: '#444444',
    MapTheme: MapDark,
    markerBorder: 0.5,
  },
  names: {
    themeName: 'dark',
  },
}
