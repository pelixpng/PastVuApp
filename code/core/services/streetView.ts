import { getApiKey } from '../../modules/app-keys'

/**
 * Street View for "how does this place look today".
 *
 * The panorama itself is Google's Maps Embed API rendered in a WebView, and availability comes from
 * the Street View Metadata endpoint. Both are free with no request limit; the Static and native
 * panorama SDKs are the billed ones, so they are deliberately not used.
 */

export type StreetViewTarget = {
  latitude: number
  longitude: number
  /** Compass degrees, clockwise from north. */
  heading?: number
  title: string
  /** The panorama metadata found near the point; opens that one instead of re-searching. */
  panoId?: string
}

export type StreetViewInfo = {
  /** `unknown` when the key is missing: the panorama is still offered, just unverified. */
  available: boolean | 'unknown'
  /** Year the panorama was shot, from metadata. */
  year?: number
  panoId?: string
}

const API_KEY: string = getApiKey('STREET_VIEW_API_KEY')

/**
 * Origin the key is locked to. Both the WebView (as `baseUrl`) and the metadata request (as
 * `Referer`) present it, so the key can carry an HTTP-referrer restriction instead of being open.
 */
export const STREET_VIEW_ORIGIN = 'https://pastvuapp.local'

export const isStreetViewConfigured = () => API_KEY.length > 0

/**
 * Compass heading for a PastVu shooting direction.
 *
 * Not `getAngle`: that one is offset for the marker icon, which is drawn pointing down, so north
 * comes out as 180 there. Street View wants the real bearing.
 */
export const getHeading = (dir?: string): number | undefined => {
  switch (dir) {
    case 'n':
      return 0
    case 'ne':
      return 45
    case 'e':
      return 90
    case 'se':
      return 135
    case 's':
      return 180
    case 'sw':
      return 225
    case 'w':
      return 270
    case 'nw':
      return 315
    default:
      return undefined
  }
}

/** Where to look from for this photo, or null when a panorama makes no sense (no geo, aerial). */
export const streetViewTarget = (photo: Photo | null | undefined): StreetViewTarget | null => {
  if (!photo || photo.dir === 'aero') return null
  const [latitude, longitude] = photo.geo ?? []
  if (typeof latitude !== 'number' || typeof longitude !== 'number') return null
  return { latitude, longitude, heading: getHeading(photo.dir), title: photo.title }
}

const location = (target: StreetViewTarget) => `${target.latitude},${target.longitude}`

export const embedUrl = (target: StreetViewTarget): string => {
  const params = new URLSearchParams({ key: API_KEY })
  // The embed itself only searches the default radius, so hand it the panorama already found.
  if (target.panoId) params.set('pano', target.panoId)
  else params.set('location', location(target))
  if (target.heading !== undefined) params.set('heading', String(target.heading))
  return `https://www.google.com/maps/embed/v1/streetview?${params.toString()}`
}

/** Deep link into the Google Maps app or site. Needs no key and is never billed. */
export const googleMapsUrl = (target: StreetViewTarget): string => {
  const params = new URLSearchParams({
    api: '1',
    map_action: 'pano',
    viewpoint: location(target),
  })
  if (target.heading !== undefined) params.set('heading', String(target.heading))
  return `https://www.google.com/maps/@?${params.toString()}`
}

/**
 * Asks Google whether a panorama exists near the point.
 *
 * Without a key the answer is `unknown` rather than `false`: the button still shows and the
 * screen falls back to the Google Maps link, so the UI keeps working on a checkout without secrets.
 */
export const checkAvailability = async (target: StreetViewTarget): Promise<StreetViewInfo> => {
  if (!isStreetViewConfigured()) return { available: 'unknown' }
  try {
    const params = new URLSearchParams({ key: API_KEY, location: location(target) })
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/streetview/metadata?${params.toString()}`,
      { headers: { Referer: `${STREET_VIEW_ORIGIN}/` } },
    )
    const body: { status?: string; date?: string; pano_id?: string } = await response.json()
    if (body.status !== 'OK') return { available: false }
    const year = Number(body.date?.split('-')[0])
    return { available: true, year: Number.isFinite(year) ? year : undefined, panoId: body.pano_id }
  } catch {
    // Network trouble is not "no coverage"; keep the button and let the screen decide.
    return { available: 'unknown' }
  }
}

/** HTML wrapper for the embed: the iframe needs a real size or the point of view breaks. */
export const panoramaHtml = (target: StreetViewTarget): string => {
  const src = embedUrl(target).replace(/&/g, '&amp;').replace(/"/g, '&quot;')
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <style>
    html, body { margin: 0; padding: 0; height: 100%; overflow: hidden; background: #000; }
    iframe { position: absolute; inset: 0; width: 100%; height: 100%; min-width: 50px; min-height: 50px; border: 0; display: block; }
  </style>
</head>
<body>
  <iframe src="${src}" allowfullscreen loading="eager"></iframe>
</body>
</html>`
}
