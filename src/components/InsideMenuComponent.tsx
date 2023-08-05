import React, { FC } from 'react'
import {
	InsideMenuContainer,
	MenuDescriptionText,
	MenuInsideTextContainer,
	MenuTitleText
} from './UniversalComponents'
import { ButtonLink } from './ButtonLink'
import { InsideMenuProps } from '../types/components'

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
					<ButtonLink title={item.title} url={item.url} key={index} />
				))}
			{CustomComponent && CustomComponent}
			{CustomComponent2 && CustomComponent2}
			{button && button}
		</InsideMenuContainer>
	)
}
