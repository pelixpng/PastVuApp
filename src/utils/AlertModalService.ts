import { Alert } from 'react-native'

export default class AlertModalService {
	static internetError = () => {
		Alert.alert('Ошибка', 'Нет подключения к интернету', [{ text: 'Ок' }])
	}

	static userLoactinoError = () => {
		Alert.alert('Ошибка', 'Нет доступа к геопозции, включите её в настройках', [
			{ text: 'Ок' }
		])
	}
}
