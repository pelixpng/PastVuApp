import React, { FC } from 'react'
import {
	AppIconContainer,
	LogoContainer,
	MenuDescriptionText,
	ScrollContainer
} from '../components/UniversalComponents'
import { ButtonLinkProps, InsideMenuProps } from '../types/components.types'
import { InsideMenuComponent } from '../components/InsideMenuComponent'

const ResourcesUsed: ButtonLinkProps[] = [
	{ title: 'PastVu Api', url: 'https://docs.pastvu.com/dev/api' },
	{ title: 'Maps Platform', url: 'https://developers.google.com/maps?hl=ru' }
]

const AboutProject: ButtonLinkProps[] = [
	{ title: 'О проекте PastVu', url: 'https://docs.pastvu.com/about' },
	{ title: 'GitHub приложения', url: 'https://github.com/pelixpng/PastVuApp' },
	{ title: 'Web версия PastVu', url: 'https://pastvu.com/' }
]

const Developers: ButtonLinkProps[] = [
	{ title: 'Семён Кузьмин', url: 'https://t.me/paveldur0' }
]

const InsideMenuText: InsideMenuProps[] = [
	{
		title: 'Что такое PastVu?',
		discription:
			'Данное приложение является мобильной версией проекта PastVu, а также имеет полностью открытый исходный код.  PastVu - проект по сбору свидетельств прошлого в фотографиях, взгляд на историю среды обитания человечества.'
	},
	{
		title: 'Используемые ресурсы',
		discription:
			'Для получения фотографий и информации о них используется открытое  Api проекта PastVu. Карта предоставлена Google Maps Platform.'
	},
	{
		title: 'Разработчики',
		discription: 'Персоны участвовашие в разработке и отладке приложения.'
	}
]

export const AppInfo: FC = () => {
	return (
		<ScrollContainer>
			<AppIconContainer>
				<LogoContainer source={require('../assets/icon.png')} />
				<MenuDescriptionText>
					Версия 1.0.0 от 5 августа 2023 г.
				</MenuDescriptionText>
			</AppIconContainer>
			<InsideMenuComponent
				ButtonArray={AboutProject}
				title={InsideMenuText[0].title}
				discription={InsideMenuText[0].discription}
			/>
			<InsideMenuComponent
				ButtonArray={ResourcesUsed}
				title={InsideMenuText[1].title}
				discription={InsideMenuText[1].discription}
			/>
			<InsideMenuComponent
				ButtonArray={Developers}
				title={InsideMenuText[2].title}
				discription={InsideMenuText[2].discription}
			/>
		</ScrollContainer>
	)
}
