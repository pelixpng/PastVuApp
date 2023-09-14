import React, { FC } from 'react'
import {
	InsideMenuContainer,
	MenuDescriptionText,
	MenuInsideTextContainer,
	MenuTitleText
} from './UniversalComponents'
import { InsideMenuProps } from '../../types/components'
import { MyButton } from '../buttons/MyButton'
import { Linking } from 'react-native'

export const InsideMenuComponent: FC<InsideMenuProps> = ({
	ButtonArray,
	title,
	discription,
	CustomComponent,
	CustomComponent2,
	HTMLdiscription,
	HTMLautor,
	HTMLsource,
	button
}) => {
	return (
		<InsideMenuContainer>
			<MenuInsideTextContainer>
				<MenuTitleText>{title}</MenuTitleText>
				<MenuDescriptionText>{discription}</MenuDescriptionText>
				{HTMLdiscription && HTMLdiscription}
				{HTMLsource && HTMLsource}
				{HTMLautor && HTMLautor}
			</MenuInsideTextContainer>
			{ButtonArray &&
				ButtonArray.map((item, index) => (
					<MyButton
						title={item.title}
						func={() => Linking.openURL(item.url)}
						key={index}
					/>
				))}
			{CustomComponent && CustomComponent}
			{CustomComponent2 && CustomComponent2}
			{button && button}
		</InsideMenuContainer>
	)
}
