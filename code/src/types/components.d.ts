import { ReactNode } from 'react'

type LinkProps = {
  title: string
  url: string
}

type YearsRangeType = [number, number]

type UICardProps = {
  ButtonArray?: ButtonLinkProps[]
  title: string
  description: string
  descriptionSecond?: string
  children?: ReactNode[] | ReactNode
}

type Direction = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw' | 'aero' | ''
