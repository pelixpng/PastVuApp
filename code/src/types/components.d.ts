import { ReactNode } from 'react'

type LinkProps = {
	title: string
	url: string
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

type MarkerProps = {
	color: string
	direction: Direction
}

type Direction = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw' | 'aero' | ''
