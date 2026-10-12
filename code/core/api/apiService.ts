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
import { getMarkerName, getMarkerClusterName } from '../utils/getMarker'
import { wrapLongitude } from '../utils/getMapData'
import { getApiKey } from '../../modules/app-keys'
import {
  UserComment,
  UserCommentObject,
  UserGalleryPhoto,
  UserProfile,
} from '../types/apiUserProfile'

const BASE_URL = 'https://api.pastvu.com/api2'
const PLACE_API_URL = 'https://us1.locationiq.com/v1'
const PLACE_API_KEY = getApiKey('PLACE_API_KEY')

/**
 * Calls a method of the PastVu HTTP API.
 *
 * News, the front-page feed, the region list and news comments used to go over a socket.io
 * connection, because the site itself talks to the server that way and these methods had no HTTP
 * counterpart. They answer over `api2` now, so the whole socket client is gone.
 *
 * The endpoint replies with HTTP 200 even for a method it does not know, describing the failure in
 * the body, so the result is what has to be checked rather than the status.
 */
/** A failed API call; `code` is the server's error code (`NO_SUCH_USER`) or the HTTP status. */
export class ApiError extends Error {
  constructor(
    method: string,
    readonly code: string | number,
  ) {
    super(`${method} failed: ${code}`)
  }
}

const apiGet = async (method: string, params?: object) => {
  const query = params ? `&params=${encodeURIComponent(JSON.stringify(params))}` : ''
  const response = await fetch(`${BASE_URL}?method=${method}${query}`)
  const json = await response.json()
  if (!json?.result) {
    throw new ApiError(method, json?.code ?? response.status)
  }
  return json.result
}

const text = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim() ? value.trim() : undefined

export default class ApiService {
  static async getPhotoList(params: getPhotoListProps) {
    // The server turns down a longitude past ±180, which a map may report for its centre after
    // going round the world.
    const response = await fetch(
      `${BASE_URL}?method=photo.giveNearestPhotos&params={"geo":[${params.latitude},${wrapLongitude(params.longitude)}],"limit":${params.limit},"distance":${params.distance},"year":${params.yearStart},"year2":${params.yearEnd}}`,
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
      marker: getMarkerName(photo.year, photo.dir),
      color: getColor(photo.year),
    }))
  }

  static async getPhotosClusters(params: getClustersPhotosProps) {
    const localWork = params.zoom >= 17
    // One request per rectangle (see getPolygons). The two sides of the 180th meridian go apart
    // rather than as one MultiPolygon: the server fixes the map's distortion and keeps a large
    // area the right way round only for a single Polygon.
    const results = await Promise.all(
      params.polygons.map(async ring => {
        const geometry = JSON.stringify({ type: 'Polygon', coordinates: [ring] })
        const response = await fetch(
          `${BASE_URL}?method=photo.getByBounds&params={"z":${params.zoom},"year":${params.yearStart},"year2":${params.yearEnd},"localWork":${localWork},"geometry":${geometry}}`,
        )
        const json: clusterResponse = await response.json()
        return json.result
      }),
    )
    const clusters = localWork
      ? []
      : results.flatMap(result => result.clusters).map(cluster => ({
          _type: 'cluster' as const,
          count: Math.min(cluster.c, 999),
          marker: getMarkerClusterName(cluster.c),
          location: {
            latitude: cluster.geo[0],
            longitude: cluster.geo[1],
          },
        }))
    const photos = results.flatMap(result => result.photos).map(photo => ({
      _type: 'photo' as const,
      cid: photo.cid.toString(),
      title: photo.title,
      year: photo.year,
      dir: getAngle(photo.dir),
      marker: getMarkerName(photo.year, photo.dir),
      color: getColor(photo.year),
      location: {
        latitude: photo.geo[0],
        longitude: photo.geo[1],
      },
    }))
    const markers = [...photos, ...clusters]
    return markers
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

  static async getNews() {
    const result = await apiGet('index.giveAllNews')
    return result.news
  }

  static async getNewsComments(cid: number) {
    const result = await apiGet('comment.giveForObj', { cid, type: 'news' })
    let convertComments: IComment[] = []
    function getConvertComments(comments: IComment[]) {
      for (let comment of comments) {
        convertComments.push(comment)
        comment.comments && getConvertComments(comment.comments)
      }
    }
    getConvertComments(result.comments)
    return {
      users: result.users,
      comments: convertComments,
    }
  }

  static async getRecentPhotos() {
    const result = await apiGet('photo.givePublicIndex')
    return result.photos
  }

  /**
   * A user's public profile. `profile.giveUser` also returns the e-mail address and the account
   * settings to anyone who asks; the site shows neither on the profile page, so neither is kept.
   * Throws `ApiError` with code `NO_SUCH_USER` for an unknown login (the lookup is case-sensitive).
   */
  static async getUserProfile(login: string): Promise<UserProfile> {
    const { user } = await apiGet('profile.giveUser', { login })
    return {
      login: user.login,
      disp: text(user.disp) ?? user.login,
      avatar: text(user.avatar),
      firstName: text(user.firstName),
      lastName: text(user.lastName),
      birthdate: text(user.birthdate),
      sex: user.sex === 'm' || user.sex === 'f' ? user.sex : undefined,
      country: text(user.country),
      city: text(user.city),
      work: text(user.work),
      www: text(user.www),
      aboutme: text(user.aboutme),
      regdate: text(user.regdate),
      pcount: Number(user.pcount) || 0,
      ccount: Number(user.ccount) || 0,
      role: Number(user.role) || 0,
      online: user.online === true,
    }
  }

  /** One page of the photos a user uploaded, newest first, with the total for paging. */
  static async getUserPhotos(login: string, skip: number, limit: number) {
    const result = await apiGet('photo.giveUserGallery', { login, skip, limit })
    return {
      total: Number(result.count) || 0,
      photos: (result.photos ?? []) as UserGalleryPhoto[],
    }
  }

  /**
   * One page (from 1) of a user's comments under photos or under news, with what they belong to.
   * Both totals come with every page, whichever kind was asked for.
   */
  static async getUserComments(login: string, page: number, type: 'photo' | 'news') {
    const result = await apiGet('comment.giveForUser', { login, page, type })
    return {
      photoTotal: Number(result.countPhoto) || 0,
      newsTotal: Number(result.countNews) || 0,
      perPage: Number(result.perPage) || 20,
      comments: (result.comments ?? []) as UserComment[],
      objects: (result.objs ?? {}) as Record<string, UserCommentObject>,
    }
  }

  static async getRegions(): Promise<Map<number, any>> {
    const result = await apiGet('region.giveListPublic')
    const regionsMap = new Map<number, any>()
    result.regions.forEach((region: any) => {
      regionsMap.set(region.cid, region)
    })
    return regionsMap
  }
}
