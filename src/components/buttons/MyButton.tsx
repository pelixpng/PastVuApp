import React, { FC } from 'react'
import { ButtonLinkContainer, ButtonLinkText } from '../ui/UniversalComponents'

type ButtonProps = {
	title: string
	func: () => void
}

export const MyButton: FC<ButtonProps> = ({ title, func }) => {
	return (
		<ButtonLinkContainer onPress={func}>
			<ButtonLinkText>{title}</ButtonLinkText>
		</ButtonLinkContainer>
	)
}
