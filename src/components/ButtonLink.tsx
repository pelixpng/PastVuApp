import { FC } from 'react'
import { Linking, Text, View } from 'react-native'
import { ButtonLinkContainer, ButtonLinkText } from './UniversalComponents'
import { ButtonLinkProps } from '../types/components.types'

export const ButtonLink: FC<ButtonLinkProps> = ({ title, url }) => {
	return (
		<ButtonLinkContainer onPress={() => Linking.openURL(url)}>
			<ButtonLinkText>{title}</ButtonLinkText>
		</ButtonLinkContainer>
	)
}
