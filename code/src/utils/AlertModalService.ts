import { Alert } from 'react-native'

export default class AlertModalService {
	static infoAlert = (title: string, description: string) => {
		Alert.alert(title, description, [{ text: 'Ок' }])
	}
}
