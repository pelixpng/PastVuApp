import { Platform } from 'react-native'
import { IComment, IComments } from '../types/apiPhotoComment'
import {
  LocationItem,
  PhotoList,
  clusterResponse,
  getClustersPhotosProps,
  getPhotoListProps,
} from '../types/apiPhotoList'
import { getColor } from '../utils/getColor'
import { getAngle } from '../utils/getDirection'
import { getMarker, getMarkerCluster } from '../utils/getMarker'

const BASE_URL = 'https://api.pastvu.com/api2'
const PLACE_API_URL = 'https://us1.locationiq.com/v1'
const PLACE_API_KEY = 'YOUR API KEY'

export default class ApiService {
  static async getPhotoList(params: getPhotoListProps) {
    const response = await fetch(
      `${BASE_URL}?method=photo.giveNearestPhotos&params={"geo":[${params.latitude},${params.longitude}],"limit":${params.limit},"distance":${params.distance},"year":${params.yearStart},"year2":${params.yearEnd}}`,
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

  static async getPhotosClusters(params: getClustersPhotosProps) {
    const localWork = params.zoom >= 17
    const response = await fetch(
      `${BASE_URL}?method=photo.getByBounds&params={"z":${params.zoom},"year":${params.yearStart},"year2":${params.yearEnd},"localWork":${localWork},"geometry":{"type":"Polygon","coordinates":[[[${params.polygon[0]}],[${params.polygon[1]}],[${params.polygon[2]}],[${params.polygon[3]}],[${params.polygon[4]}]]]}}`,
    )
    const jsonPromise = response.json() as Promise<clusterResponse>
    const [json] = await Promise.all([jsonPromise])
    const clustersPromise = localWork
      ? []
      : json.result.clusters.map(cluster => ({
          count: Math.min(cluster.c, 999),
          marker: Platform.OS === 'android' ? getMarkerCluster(cluster.c) : [],
          location: {
            latitude: cluster.geo[0],
            longitude: cluster.geo[1],
          },
        }))
    const photosPromise = json.result.photos.map(photo => ({
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
    const [clusters, photos] = await Promise.all([clustersPromise, photosPromise])
    return { clusters, photos }
  }

  static async getPhotoInfo(cid: string) {
    const response = await fetch(`${BASE_URL}?method=photo.giveForPage&params={"cid":${cid}}`)
    return (await response.json()) as PhotoInfo
  }

  static async getComments(cid: string) {
    const response = await fetch(`${BASE_URL}?method=comment.giveForObj&params={"cid":${cid}}`)
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

  static async searchPlace(query: string) {
    const response = await fetch(
      `${PLACE_API_URL}/autocomplete?key=${PLACE_API_KEY}&q=${query}&format=json&limit=5`,
    )
    if (!response.ok) {
      throw new Error(response.status.toString())
    }
    return (await response.json()) as LocationItem[]
  }
}
