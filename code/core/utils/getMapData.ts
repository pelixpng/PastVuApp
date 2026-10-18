import { Region } from 'react-native-maps'

export const getZoom = (latitudeDelta: number) => {
  const zoom = Math.round(Math.log2(360 / latitudeDelta))
  const thresholds = [4, 6, 7, 8, 10, 12, 13, 16]
  const zoomLevels = [5, 7, 8, 9, 11, 13, 14, 16]
  return zoomLevels[thresholds.findIndex(threshold => zoom <= threshold)] ?? zoom
}

export const zoomLevelToAltitude = (zoomLevel: number) => {
  return Math.pow(2, 19 - zoomLevel) * 150
}

/** A longitude brought back into -180..180, however far round the world it has gone. */
export const wrapLongitude = (longitude: number) =>
  ((((longitude + 180) % 360) + 360) % 360) - 180

const EARTH_RADIUS_M = 6371000

type Point = { latitude: number; longitude: number }

/** Distance along the ground between two points, in metres; a sphere is close enough for a list. */
export const distanceInMeters = (from: Point, to: Point) => {
  const rad = Math.PI / 180
  const dLat = (to.latitude - from.latitude) * rad
  const dLon = (to.longitude - from.longitude) * rad
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(from.latitude * rad) * Math.cos(to.latitude * rad) * Math.sin(dLon / 2) ** 2
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)))
}

/** A closed ring of [longitude, latitude] pairs: the outline of a GeoJSON polygon. */
export type PolygonRing = [number, number][]

// Narrower than this, a piece left at the 180th meridian is a degenerate ring the server rejects.
const MIN_PIECE_WIDTH = 1e-6

/**
 * The visible area as the server will take it: one rectangle, or two when the view crosses the
 * 180th meridian.
 *
 * The server passes the polygon to MongoDB unchecked, and a latitude past ±90, a longitude past
 * ±180 or a ring of zero width fails the whole request. The edges of the view get there in two
 * places. Near a pole the top or bottom edge reaches past 90: the Yandex map estimates the height
 * of the view from its width, which overshoots more the closer the pole. Over Chukotka and Alaska
 * one side reaches past 180. So the latitude is clamped, a view across the meridian is split into
 * a rectangle on each side, and a view as wide as the world asks for all of it.
 */
export const getPolygons = (region: Region): PolygonRing[] => {
  const south = Math.max(region.latitude - region.latitudeDelta / 2, -90)
  const north = Math.min(region.latitude + region.latitudeDelta / 2, 90)
  // Counter-clockwise, as the server reads a ring: the area it covers is the one on its left.
  const box = (west: number, east: number): PolygonRing => [
    [west, south],
    [east, south],
    [east, north],
    [west, north],
    [west, south],
  ]
  // Google on Android reports a view across the meridian with a negative width.
  const width = region.longitudeDelta > 0 ? region.longitudeDelta : region.longitudeDelta + 360
  if (width >= 360) return [box(-180, 180)]
  // In case a map reports its centre past 180 after going round the world.
  const center = wrapLongitude(region.longitude)
  const west = center - width / 2
  const east = center + width / 2
  const spans =
    west < -180
      ? [
          [west + 360, 180],
          [-180, east],
        ]
      : east > 180
        ? [
            [west, 180],
            [-180, east - 360],
          ]
        : [[west, east]]
  return spans.filter(([w, e]) => e - w > MIN_PIECE_WIDTH).map(([w, e]) => box(w, e))
}
