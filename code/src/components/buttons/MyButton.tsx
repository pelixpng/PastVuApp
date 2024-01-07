import React, { FC } from 'react'
import { ButtonLinkContainer, ButtonLinkText } from '../ui/UniversalComponents'
import { DimensionValue } from 'react-native'

type ButtonProps = {
	title: string
	func: () => void
	width?: DimensionValue
}

export const MyButton: FC<ButtonProps> = ({ title, func, width }) => {
	const currentWidth = width ?? '100%'
	return (
		<ButtonLinkContainer style={{ width: currentWidth }} onPress={func}>
			<ButtonLinkText>{title}</ButtonLinkText>
		</ButtonLinkContainer>
	)
}
