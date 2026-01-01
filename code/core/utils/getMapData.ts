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

export const getPolygon = (region: Region) => {
  const fixPolygon = (latitude: number, longitude: number) => {
    const fixLatitude = latitude
    const fixLongitude = longitude
    if (latitude <= -90 || latitude >= 90) fixLatitude - 180
    if (longitude <= -180) fixLongitude + 360
    if (longitude >= 180) fixLongitude - 360
    return [fixLatitude, fixLongitude]
  }

  const { latitude, longitude, latitudeDelta, longitudeDelta } = region
  const one = fixPolygon(longitude - longitudeDelta / 2, latitude - latitudeDelta / 2)
  const two = fixPolygon(longitude + longitudeDelta / 2, latitude - latitudeDelta / 2)
  const three = fixPolygon(longitude + longitudeDelta / 2, latitude + latitudeDelta / 2)
  const fourth = fixPolygon(longitude - longitudeDelta / 2, latitude + latitudeDelta / 2)
  const polygonCoordinates = [one, two, three, fourth, one]
  return polygonCoordinates
}
