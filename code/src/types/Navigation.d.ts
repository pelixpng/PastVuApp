import type { NativeStackScreenProps } from '@react-navigation/native-stack'

type RootStackParamList = {
	StartScreen: undefined
	History: undefined
	MapComponent: undefined
	PhotoPage: { params: { PhotoJson: PhotoInfo } }
}

type SettingsStackParamList = {
	AppInfo: undefined
	ChangeTheme: undefined
	FeedBack: undefined
	SettingsComponent: undefined
	MapSettings: undefined
}
