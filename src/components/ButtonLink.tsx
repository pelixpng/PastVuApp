import React, { FC } from 'react'
import { Linking } from 'react-native'
import { ButtonLinkContainer, ButtonLinkText } from './UniversalComponents'
import { ButtonLinkProps } from '../types/components'

export const ButtonLink: FC<ButtonLinkProps> = ({ title, url }) => {
	return (
		<ButtonLinkContainer onPress={() => Linking.openURL(url)}>
			<ButtonLinkText>{title}</ButtonLinkText>
		</ButtonLinkContainer>
	)
}
