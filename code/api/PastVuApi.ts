import { IComments } from '../src/types/apiPhotoComment'
import {
	PhotoList,
	getPhotoListProps,
	itemPhotoArray
} from '../src/types/apiPhotoList'
import { getColor } from '../src/utils/getColor'
import { getAngle } from '../src/utils/getDirection'

export default class ApiService {
	static async getPhotoList(params: getPhotoListProps) {
		const response = await fetch(
			`https://pastvu.com/api2?method=photo.giveNearestPhotos&params={"geo":[${params.latitude},${params.longitude}],"limit":${params.limit},"distance":${params.distance},"year":${params.yearStart},"year2":${params.yearEnd}}`
		)
		const json = (await response.json()) as PhotoList
		const photoArray: itemPhotoArray[] = []
		for (let i = 0; i < json.result.photos.length; i++) {
			photoArray.push({
				title: json.result.photos[i].title,
				location: {
					latitude: json.result.photos[i].geo[0],
					longitude: json.result.photos[i].geo[1]
				},
				cid: json.result.photos[i].cid.toString(),
				year: json.result.photos[i].year,
				dir: getAngle(json.result.photos[i].dir),
				color: getColor(json.result.photos[i].year)
			})
		}
		return photoArray
	}

	static async getPhotoInfo(cid: string) {
		const response = await fetch(
			`https://pastvu.com/api2?method=photo.giveForPage&params={"cid":${cid}}`
		)
		const json = (await response.json()) as PhotoInfo
		return json
	}

	static async getComments(cid: string) {
		const response = await fetch(
			`https://pastvu.com/api2?method=comment.giveForObj&params={"cid":${cid}}`
		)
		const json = (await response.json()) as IComments
		return json
	}
}
