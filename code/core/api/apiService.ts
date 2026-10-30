import { IComment, IComments } from '../types/apiPhotoComment'
import { NewsPhoto } from '../types/apiNews'
import {
  LocationItem,
  NearbyPhoto,
  PhotoList,
  clusterResponse,
  getClustersPhotosProps,
  getPhotoListProps,
} from '../types/apiPhotoList'
import { getColor } from '../utils/getColor'
import { getAngle } from '../utils/getDirection'
import { getMarkerName, getMarkerClusterName } from '../utils/getMarker'
import { wrapLongitude } from '../utils/getMapData'
import { RegionHash } from '../utils/getRegionPath'
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

/** A failed API call; `code` is the server's error code (`NO_SUCH_USER`) or the HTTP status. */
export class ApiError extends Error {
  constructor(
    method: string,
    readonly code: string | number,
  ) {
    super(`${method} failed: ${code}`)
  }
}

/**
 * Why a place search failed: one of LocationIQ's rate limits (per second, per minute, per day),
 * or anything else, from a network failure to a rejected key.
 */
export type PlaceSearchFailure = 'second' | 'minute' | 'day' | 'error'

/** A place search that brought no answer; `status` is the HTTP status, when there was one. */
export class PlaceSearchError extends Error {
  constructor(
    readonly kind: PlaceSearchFailure,
    readonly status?: number,
  ) {
    super(`searchPlace failed: ${kind}${status ? ` (HTTP ${status})` : ''}`)
  }
}

/**
 * Which limit a 429 is for, from the `error` LocationIQ sends with it. An unreadable or unknown
 * reason is taken for the per-second limit, the one the app runs into in practice.
 */
const rateLimit = (reason: unknown): PlaceSearchFailure => {
  switch (reason) {
    case 'Rate Limited Minute':
      return 'minute'
    case 'Rate Limited Day':
      return 'day'
    default:
      return 'second'
  }
}

/** A fetch given up through its AbortSignal, as opposed to one that failed. */
export const isAbort = (error: unknown) =>
  (error as { name?: unknown } | null)?.name === 'AbortError'

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

/**
 * A discussion's comment tree as one list: each comment followed by its replies, depth first, the
 * order the comment list draws them in (indented by their `level`).
 */
const flattenComments = (comments: IComment[]): IComment[] => {
  const flat: IComment[] = []
  const walk = (list: IComment[]) => {
    for (const comment of list) {
      flat.push(comment)
      if (comment.comments) walk(comment.comments)
    }
  }
  walk(comments)
  return flat
}

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

  /**
   * The photos closest to a point, nearest first. The strip under a photo leaves the photo itself
   * out with `exceptCid` and asks for every period; the map's nearby sheet passes the years on the
   * slider.
   */
  static async getNearbyPhotos(
    latitude: number,
    longitude: number,
    exceptCid?: string,
    limit = 16,
    years?: [number, number],
  ): Promise<NearbyPhoto[]> {
    const { photos } = (await apiGet('photo.giveNearestPhotos', {
      geo: [latitude, wrapLongitude(longitude)],
      limit,
      ...(exceptCid ? { except: Number(exceptCid) } : {}),
      ...(years ? { year: years[0], year2: years[1] } : {}),
    })) as PhotoList['result']
    return (photos ?? []).map(photo => ({
      cid: photo.cid.toString(),
      title: photo.title,
      year: photo.year,
      file: photo.file,
      location: { latitude: photo.geo[0], longitude: photo.geo[1] },
    }))
  }

  /**
   * The end years of the photos' date ranges, which photo.giveNearestPhotos leaves out:
   * photo.getByBounds over the small box around them returns `year2`, in one request. Photos it
   * misses keep their single year. Keyed by cid; only ranges, not single years.
   */
  static async getYearRanges(
    photos: Pick<NearbyPhoto, 'cid' | 'location'>[],
    years: [number, number] = [1826, 2000],
  ): Promise<Map<string, number>> {
    const ranges = new Map<string, number>()
    if (!photos.length) return ranges
    const latitudes = photos.map(photo => photo.location.latitude)
    const longitudes = photos.map(photo => wrapLongitude(photo.location.longitude))
    // A little room around the outermost photos, which sit right on the box's edge otherwise.
    const pad = 0.0005
    const south = Math.max(Math.min(...latitudes) - pad, -90)
    const north = Math.min(Math.max(...latitudes) + pad, 90)
    const west = Math.min(...longitudes) - pad
    const east = Math.max(...longitudes) + pad
    // The server turns down longitudes past ±180, and a box across that meridian would span the
    // world the other way round: such photos keep their single year.
    if (west < -180 || east > 180 || east - west > 180) return ranges
    const ring = [
      [west, south],
      [east, south],
      [east, north],
      [west, north],
      [west, south],
    ]
    const { photos: found } = (await apiGet('photo.getByBounds', {
      // From zoom 17 the server sends the photos themselves rather than clusters.
      z: 17,
      localWork: true,
      year: years[0],
      year2: years[1],
      geometry: { type: 'Polygon', coordinates: [ring] },
    })) as { photos?: { cid: number; year?: number; year2?: number }[] }
    for (const photo of found ?? []) {
      if (photo.year2 && photo.year2 !== photo.year) ranges.set(photo.cid.toString(), photo.year2)
    }
    return ranges
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
    const result = (await apiGet('comment.giveForObj', {
      cid: Number(cid),
    })) as IComments['result']
    return {
      users: result.users,
      comments: flattenComments(result.comments),
    }
  }

  /**
   * Places matching `query` as typed so far, up to 8, named in `lang` where LocationIQ has that
   * language. Nothing found is an empty list rather than an error: LocationIQ answers it with 404
   * "Unable to geocode". Throws PlaceSearchError for a refusal, a network failure or an answer
   * that is not a list, and rethrows the fetch's own AbortError untouched when `signal` aborts it.
   */
  static async searchPlace(
    query: string,
    lang: string,
    signal?: AbortSignal,
  ): Promise<LocationItem[]> {
    const params = new URLSearchParams({
      key: PLACE_API_KEY,
      q: query,
      limit: '8',
      dedupe: '1',
      'accept-language': lang,
      format: 'json',
    })
    let response: Response
    try {
      response = await fetch(`${PLACE_API_URL}/autocomplete?${params}`, { signal })
    } catch (error) {
      if (isAbort(error)) throw error
      throw new PlaceSearchError('error')
    }
    if (response.status === 404) return []
    if (response.status === 429) {
      // Which limit was hit decides whether waiting a moment helps.
      const body = await response.json().catch(() => null)
      throw new PlaceSearchError(rateLimit(body?.error), 429)
    }
    if (response.status === 401 || response.status === 403) {
      console.warn(`LocationIQ rejected the place search key (HTTP ${response.status})`)
    }
    if (!response.ok) throw new PlaceSearchError('error', response.status)
    const places = await response.json().catch(() => null)
    if (!Array.isArray(places)) throw new PlaceSearchError('error', response.status)
    return places as LocationItem[]
  }

  static async getNews() {
    const result = await apiGet('index.giveAllNews')
    return result.news
  }

  static async getNewsComments(cid: number) {
    const result = await apiGet('comment.giveForObj', { cid, type: 'news' })
    return {
      users: result.users,
      comments: flattenComments(result.comments),
    }
  }

  /** The site's latest photos, with the names of their regions (absent when there are none). */
  static async getRecentPhotos(): Promise<{ photos: NewsPhoto[]; rhash: RegionHash }> {
    const result = await apiGet('photo.givePublicIndex')
    return { photos: result.photos ?? [], rhash: result.rhash ?? {} }
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

  /**
   * One page of the photos a user uploaded, newest first, with the total for paging and the names
   * of the page's regions (absent from an empty page).
   */
  static async getUserPhotos(login: string, skip: number, limit: number) {
    const result = await apiGet('photo.giveUserGallery', { login, skip, limit })
    return {
      total: Number(result.count) || 0,
      photos: (result.photos ?? []) as UserGalleryPhoto[],
      rhash: (result.rhash ?? {}) as RegionHash,
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
}
