import { IComment, IComments } from '../types/apiPhotoComment'
import { PhotoList, getPhotoListProps, itemPhotoArray } from '../types/apiPhotoList'
import { getColor } from '../utils/getColor'
import { getAngle } from '../utils/getDirection'
import { getMarker } from '../utils/getMarker'

export default class ApiService {
  static async getPhotoList(params: getPhotoListProps) {
    const response = await fetch(
      `https://pastvu.com/api2?method=photo.giveNearestPhotos&params={"geo":[${params.latitude},${params.longitude}],"limit":${params.limit},"distance":${params.distance},"year":${params.yearStart},"year2":${params.yearEnd}}`,
    )
    const json = (await response.json()) as PhotoList
    const photoArray: itemPhotoArray[] = []
    for (let i = 0; i < json.result.photos.length; i++) {
      photoArray.push({
        title: json.result.photos[i].title,
        location: {
          latitude: json.result.photos[i].geo[0],
          longitude: json.result.photos[i].geo[1],
        },
        cid: json.result.photos[i].cid.toString(),
        year: json.result.photos[i].year,
        dir: getAngle(json.result.photos[i].dir),
        marker: getMarker(json.result.photos[i].year, json.result.photos[i].dir),
        color: getColor(json.result.photos[i].year),
      })
    }
    return photoArray
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
    const arr = json.result.comments
    let convertComments: IComment[] = []
    function getConvertComments(comments: IComment[]) {
      for (let comment of comments) {
        convertComments.push(comment)
        if (comment.comments) {
          getConvertComments(comment.comments)
        }
      }
    }
    getConvertComments(arr)
    return {
      users: json.result.users,
      comments: convertComments,
    }
  }
}
