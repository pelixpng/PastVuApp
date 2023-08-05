import React, { FC } from 'react'
import { Share } from 'react-native'
import { ButtonLinkContainer, ButtonLinkText } from './UniversalComponents'
import { ButtonLinkProps } from '../types/components'

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
