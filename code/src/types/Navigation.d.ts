import type { NativeStackScreenProps } from '@react-navigation/native-stack'

type RootStackParamList = {
	History: undefined
	MapComponent: undefined
	ErrorLoad: undefined
	PhotoPage: { PhotoJson: Root }
}

type SettingsStackParamList = {
	AppInfo: undefined
	ChangeTheme: undefined
	FeedBack: undefined
	SettingsComponent: undefined
	MapSettings: undefined
}

export type SettingsRoutes =
	| 'AppInfo'
	| 'FeedBack'
	| 'SettingsComponent'
	| 'MapSettings'
