export interface StyledColor {
	bg?: string
	height?: string
}

declare module 'styled-components' {
	export interface DefaultTheme {
		colors: {
			backgroundApp: string
			tabBarActiveTint: string
			tabBarInactiveTintColor: string
			titleMenuText: string
			MenuDescriptionText: string
			BackgroundMenuIcon: string
			MenuContainer: string
			SliderRangeBG: string
			Delimetr: string
		}
		names: {
			themeName: ThemeNameType
		}
	}
}
