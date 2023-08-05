import React, { FC } from 'react'
import { perfectSize } from '../utils/ScreenSize'
import {
	MenuContainer,
	MenuTextContainer,
	MenuTitleText,
	MenuDescriptionText,
	BackgroundMenuIcon
} from './UniversalComponents'
import { Feather } from '@expo/vector-icons'
import { MenuButtonProps } from '../types/components'

export const MenuButton: FC<MenuButtonProps> = ({
	navigation,
	route,
	title,
	discription,
	icon
}) => {
	const handlePress = () => {
		navigation.navigate(route)
	}
	return (
		<MenuContainer onPress={handlePress}>
			<MenuTextContainer>
				<MenuTitleText>{title}</MenuTitleText>
				<MenuDescriptionText>{discription}</MenuDescriptionText>
			</MenuTextContainer>
			<BackgroundMenuIcon>
				<Feather
					name={icon}
					size={perfectSize(22)}
					color="rgba(112, 182, 246, 1)"
				/>
			</BackgroundMenuIcon>
		</MenuContainer>
	)
}
