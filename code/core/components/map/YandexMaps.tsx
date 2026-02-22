import { YaMap, Marker, CameraPosition, MapType } from 'react-native-yamap-lite'
import { StyleSheet, NativeSyntheticEvent, Dimensions, View } from 'react-native'
import { RefObject, useRef } from 'react'
import { useTheme } from '@react-navigation/native'
import { Region } from 'react-native-maps'
import { MapMarker } from '../../types/apiPhotoList'
import { getZoom } from '../../utils/getMapData'
import { yamapRef } from '../../../mobile/screens/home/map/Map.vm'

type Props = {
  mapRef: RefObject<any>
  markers: MapMarker[]
  mapMarkerType: string
  initialRegion: Region
  onRegionChangeComplete: (region: Region) => void
  onShowPhoto: (cid: string, title: string) => void
  onGoToLocation: (lat: number, lng: number) => void
}

export const YandexMaps = ({
  markers,
  initialRegion,
  onRegionChangeComplete,
  onShowPhoto,
  onGoToLocation,
}: Props) => {
  const { names } = useTheme()

  const yamapInitialRegion = useRef({
    lat: initialRegion.latitude,
    lon: initialRegion.longitude,
    zoom: getZoom(initialRegion.latitudeDelta),
  }).current

  const handleCameraChange = (e: NativeSyntheticEvent<CameraPosition>) => {
    const { point, zoom } = e.nativeEvent
    const latitudeDelta = 360 / Math.pow(2, zoom)
    onRegionChangeComplete({
      latitude: point.lat,
      longitude: point.lon,
      latitudeDelta,
      longitudeDelta: latitudeDelta,
    })
  }
  return (
    <YaMap
      ref={yamapRef}
      style={{ flex: 1 }}
      nightMode={names.themeName === 'dark'}
      showUserPosition={false}
      rotateGesturesEnabled={false}
      initialRegion={yamapInitialRegion}
      onCameraPositionChangeEnd={handleCameraChange}>
      {markers.map((marker, index) => {
        if (marker._type === 'photo') {
          return (
            <Marker
              key={index}
              point={{ lat: marker.location.latitude, lon: marker.location.longitude }}
              source={{ uri: names.themeName === 'light' ? marker.marker[0] : marker.marker[1] }}
              onPress={() => onShowPhoto(marker.cid, marker.title)}
            />
          )
        } else {
          return (
            <Marker
              key={index}
              point={{ lat: marker.location.latitude, lon: marker.location.longitude }}
              source={{ uri: names.themeName === 'light' ? marker.marker[0] : marker.marker[1] }}
              onPress={() => onGoToLocation(marker.location.latitude, marker.location.longitude)}
            />
          )
        }
      })}
    </YaMap>
  )
}
