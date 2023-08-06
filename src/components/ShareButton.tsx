import React, { FC } from 'react'
import { Share } from 'react-native'
import { ButtonLinkContainer, ButtonLinkText } from './UniversalComponents'
import { ButtonLinkProps } from '../types/components'

export const ShareButton: FC<ButtonLinkProps> = ({ title, url, postTitle }) => {
	const shareLink = () => {
		Share.share({
			message: postTitle + ': ' + url
		})
	}
	return (
		<ButtonLinkContainer onPress={shareLink}>
			<ButtonLinkText>{title}</ButtonLinkText>
		</ButtonLinkContainer>
	)
}
