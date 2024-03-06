import { Direction } from '../types/components'

export const getAngle = (direction: Direction | undefined): number => {
	switch (direction) {
		case 'n':
			return 180
		case 'ne':
			return 225
		case 'e':
			return 270
		case 'se':
			return 315
		case 's':
			return 360
		case 'sw':
			return 45
		case 'w':
			return 90
		case 'nw':
			return 135
		case 'aero':
			return 0
		default:
			return 0
	}
}
