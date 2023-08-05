import { FC } from 'react'
import { Text, View } from 'react-native'

export const ErrorLoad: FC = () => {
	return (
		<View>
			<Text>ОШИБКА! Необходимо подключение к интернету.</Text>
		</View>
	)
}
