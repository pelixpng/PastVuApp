import React, { FC } from 'react'
import { perfectSize } from '../../utils/ScreenSize'
import {
	MenuContainer,
	MenuTextContainer,
	MenuTitleText,
	MenuDescriptionText,
	BackgroundMenuIcon
} from '../ui/UniversalComponents'
import { Feather } from '@expo/vector-icons'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { SettingsRoutes, SettingsStackParamList } from '../../types/Navigation'

type MenuButtonProps = {
	navigation: any
	route: SettingsRoutes
	title: string
	discription: string
	icon: 'mail' | 'info' | 'settings'
}

type settingProp = NavigationProp<SettingsStackParamList>

export const MenuButton: FC<MenuButtonProps> = ({
	route,
	title,
	discription,
	icon
}) => {
	const navigation = useNavigation<settingProp>()
	return (
		<MenuContainer onPress={() => navigation.navigate(route)}>
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
