import React, { FC } from 'react'
import { ViewContainer } from '../components/UniversalComponents'
import { ButtonLinkProps, InsideMenuProps } from '../types/components'
import { InsideMenuComponent } from '../components/InsideMenuComponent'

const ButtonArray: ButtonLinkProps[] = [
	{ title: 'Telegram', url: 'https://t.me/paveldur0' },
	{ title: 'Почта', url: 'mailto:semeonky@gmail.com' }
]

const InsideMenuText: InsideMenuProps[] = [
	{
		title: 'Нужна помощь?',
		discription:
			'Если у вас возникли проблемы во время использования приложения, вы можете связаться с разработчиком через почту или телеграмм.'
	}
]

export const FeedBack: FC = () => {
	return (
		<ViewContainer>
			<InsideMenuComponent
				ButtonArray={ButtonArray}
				title={InsideMenuText[0].title}
				discription={InsideMenuText[0].discription}
			/>
		</ViewContainer>
	)
}
