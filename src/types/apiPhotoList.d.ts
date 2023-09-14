import { Direction } from './components'

interface PhotoList {
	result: Result
	rid: string
}

interface Result {
	photos: Photo[]
}

interface Photo {
	cid: number
	file: string
	s: number
	year: number
	title: string
	dir?: Direction
	geo: number[]
	ccount?: number
}

type getPhotoListProps = {
	latitude: number
	longitude: number
	limit?: number
	distance?: number
	yearStart: number
	yearEnd: number
}

type itemPhotoArray = {
	year: number
	title: string
	cid: string
	location: {
		latitude: number
		longitude: number
	}
	dir: number
	color: string
}
