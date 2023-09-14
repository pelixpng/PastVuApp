import { Direction } from '../types/components'

export const getAngle = (direction: Direction): number => {
	switch (direction) {
		case 'n':
			return 180.0
		case 'ne':
			return 225.0
		case 'e':
			return 270.0
		case 'se':
			return 315.0
		case 's':
			return 360.0
		case 'sw':
			return 45.0
		case 'w':
			return 90.0
		case 'nw':
			return 135.0
		case 'aero':
			return 0.0
		default:
			return 0.0
	}
}
