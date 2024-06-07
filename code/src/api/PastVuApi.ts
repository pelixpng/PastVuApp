import { IComment, IComments } from '../types/apiPhotoComment'
import { PhotoList, getPhotoListProps } from '../types/apiPhotoList'
import { getColor } from '../utils/getColor'
import { getAngle } from '../utils/getDirection'
import { getMarker } from '../utils/getMarker'

export default class ApiService {
  static async getPhotoList(params: getPhotoListProps) {
    const response = await fetch(
      `https://pastvu.com/api2?method=photo.giveNearestPhotos&params={"geo":[${params.latitude},${params.longitude}],"limit":${params.limit},"distance":${params.distance},"year":${params.yearStart},"year2":${params.yearEnd}}`,
    )
    const json = (await response.json()) as PhotoList
    return json.result.photos.map(photo => ({
      title: photo.title,
      location: {
        latitude: photo.geo[0],
        longitude: photo.geo[1],
      },
      cid: photo.cid.toString(),
      year: photo.year,
      dir: getAngle(photo.dir),
      marker: getMarker(photo.year, photo.dir),
      color: getColor(photo.year),
    }))
  }

  static async getPhotoInfo(cid: string) {
    const response = await fetch(
      `https://pastvu.com/api2?method=photo.giveForPage&params={"cid":${cid}}`,
    )
    return (await response.json()) as PhotoInfo
  }

  static async getComments(cid: string) {
    const response = await fetch(
      `https://pastvu.com/api2?method=comment.giveForObj&params={"cid":${cid}}`,
    )
    const json = (await response.json()) as IComments
    let convertComments: IComment[] = []
    function getConvertComments(comments: IComment[]) {
      for (let comment of comments) {
        convertComments.push(comment)
        comment.comments && getConvertComments(comment.comments)
      }
    }
    getConvertComments(json.result.comments)
    return {
      users: json.result.users,
      comments: convertComments,
    }
  }
}
