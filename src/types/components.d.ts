import { ReactNode } from 'react'

type MenuButtonProps = {
	navigation: any
	route: string
	title: string
	discription: string
	icon: 'mail' | 'info' | 'settings'
}

type InsideMenuProps = {
	ButtonArray?: ButtonLinkProps[]
	title: string
	discription: string
	CustomComponent?: ReactNode
	CustomComponent2?: ReactNode
	HTMLdiscription?: ReactNode
	HTMLsource?: ReactNode
	HTMLautor?: ReactNode
	button?: ReactNode
}

type ButtonLinkProps = {
	title: string
	url: string
	postTitle?: string
}

type PhotoPageProps = {
	route: { params: { PhotoJson: Root } }
}

type SliderComponentProps = {
	value: number
	setValue: (value: number) => void
	title: string
	minValue: number
	maxValue: number
}

type YearsSliderComponentProps = {
	value: YearsRangeType
	setValue: (value: YearsRangeType) => void
}
