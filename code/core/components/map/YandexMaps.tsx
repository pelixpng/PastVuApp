import { YaMap, Marker } from 'react-native-yamap-lite'
import { StyleSheet, View, LayoutChangeEvent } from 'react-native'

type CameraPosition = {
  nativeEvent: {
    point: { lat: number; lon: number }
    zoom: number
  }
}
import { RefObject, useRef, useState } from 'react'
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
  const [lockedHeight, setLockedHeight] = useState(0)
  const lockedHeightRef = useRef(0)

  const yamapInitialRegion = useRef({
    lat: initialRegion.latitude,
    lon: initialRegion.longitude,
    zoom: getZoom(initialRegion.latitudeDelta),
  }).current

  const handleCameraChange = (e: CameraPosition) => {
    const { point, zoom } = e.nativeEvent
    const latitudeDelta = 360 / Math.pow(2, zoom)
    onRegionChangeComplete({
      latitude: point.lat,
      longitude: point.lon,
      latitudeDelta,
      longitudeDelta: latitudeDelta,
    })
  }

  const onLayout = (e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height
    if (h > 0) {
      if (h > lockedHeightRef.current) {
        lockedHeightRef.current = h
        setLockedHeight(h)
      }
    }
  }

  return (
    <View style={lockedHeight > 0 ? { height: lockedHeight } : s.flexOne} onLayout={onLayout}>
      <YaMap
        ref={yamapRef}
        style={s.flexOne}
        nightMode={names.themeName === 'dark'}
        showUserPosition={false}
        minZoomPreference={4}
        initialRegion={yamapInitialRegion}
        onCameraPositionChangeEnd={handleCameraChange}>
        {markers.map((marker, index) => {
          if (marker._type === 'photo') {
            return (
              <Marker
                key={index}
                rotated
                rotation={marker.dir}
                point={{ lat: marker.location.latitude, lon: marker.location.longitude }}
                source={{
                  uri: names.themeName === 'light' ? marker.marker[0] : marker.marker[1],
                }}
                onPress={() => onShowPhoto(marker.cid, marker.title)}
              />
            )
          } else {
            return (
              <Marker
                key={index}
                point={{ lat: marker.location.latitude, lon: marker.location.longitude }}
                source={{
                  uri: names.themeName === 'light' ? marker.marker[0] : marker.marker[1],
                }}
                onPress={() => onGoToLocation(marker.location.latitude, marker.location.longitude)}
              />
            )
          }
        })}
      </YaMap>
    </View>
  )
}

const s = StyleSheet.create({
  flexOne: { flex: 1 },
})
