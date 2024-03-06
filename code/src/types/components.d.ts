import { ReactNode } from 'react'

type LinkProps = {
	title: string
	url: string
}

type YearsRangeType = [number, number]

type InsideMenuProps = {
	ButtonArray?: ButtonLinkProps[]
	title: string
	description: string
	children?: ReactNode[] | ReactNode
}

type Direction = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw' | 'aero' | ''
