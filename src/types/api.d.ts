type itemPhotoArray = {
	year: number
	title: string
	cid: string
	location: {
		latitude: number
		longitude: number
	}
}

type PhotoProps = {
	url: string
}

type YearsRangeType = [number, number]

type getPhotoListProps = {
	latitude: number
	longitude: number
	limit?: number
	distance?: number
	yearStart: number
	yearEnd: number
}
