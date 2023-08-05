import { FC } from 'react'
import { Linking, Share, Text, View } from 'react-native'
import { ButtonLinkContainer, ButtonLinkText } from './UniversalComponents'
import { ButtonLinkProps } from '../types/components.types'

export const ShareButton: FC<ButtonLinkProps> = ({ title, url }) => {
	const shareLink = () => {
		Share.share({
			message: 'Посмотри как это место выглядело много лет назад: ' + url
		})
	}
	return (
		<ButtonLinkContainer onPress={shareLink}>
			<ButtonLinkText>{title}</ButtonLinkText>
		</ButtonLinkContainer>
	)
}
