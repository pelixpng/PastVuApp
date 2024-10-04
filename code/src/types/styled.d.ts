export interface StyledColor {
  bg?: string
  height?: string
}

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      backgroundApp: string
      textFirst: string
      textThird: string
      textSecond: string
      baseSecond: string
      baseThird: string
      basePrimary: string
      baseFourth: string
      MapTheme: Array
      markerBorder: number
    }
    names: {
      themeName: ThemeNameType
    }
  }
}
