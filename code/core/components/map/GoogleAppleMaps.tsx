import MapView, { Marker, MapType, Region } from 'react-native-maps'
import { Platform, StyleSheet } from 'react-native'
import { RefObject } from 'react'
import { useTheme } from '@react-navigation/native'
import { MapMarker } from '../../types/apiPhotoList'
import { ClusterMarker } from './ClusterMarker'

type Props = {
  mapRef: RefObject<MapView | null>
  markers: MapMarker[]
  mapType: MapType
  mapMarkerType: string
  initialRegion: Region
  onRegionChangeComplete: (region: Region) => void
  onShowPhoto: (cid: string, title: string) => void
  onGoToLocation: (lat: number, lng: number) => void
}

export const GoogleAppleMaps = ({
  mapRef,
  markers,
  mapType,
  mapMarkerType,
  initialRegion,
  onRegionChangeComplete,
  onShowPhoto,
  onGoToLocation,
}: Props) => {
  const { colors, names } = useTheme()

  return (
    <MapView
      ref={mapRef}
      style={s.flexOne}
      userInterfaceStyle={names.themeName}
      customMapStyle={colors.MapTheme}
      onRegionChangeComplete={onRegionChangeComplete}
      showsUserLocation={true}
      showsMyLocationButton={false}
      initialRegion={initialRegion}
      showsPointsOfInterests={false}
      loadingBackgroundColor={colors.backgroundApp}
      moveOnMarkerPress={false}
      rotateEnabled={false}
      cameraZoomRange={{
        minCenterCoordinateDistance: 100,
        maxCenterCoordinateDistance: 10000000,
        animated: false,
      }}
      mapType={mapType}>
      {markers.map(marker => {
        if (marker._type === 'photo') {
          return (
            <Marker
              // Keyed by identity, not by array index: the list mixes photos and clusters, so an
              // index key made React reuse a photo's marker for a cluster and vice versa.
              key={`photo-${marker.cid}`}
              coordinate={marker.location}
              tracksViewChanges={false}
              rotation={marker.dir}
              pinColor={marker.color}
              onPress={() => onShowPhoto(marker.cid, marker.title)}
              style={
                Platform.OS === 'ios' && {
                  transform: [{ rotate: `${marker.dir}deg` }],
                }
              }
              image={
                mapMarkerType === 'new'
                  ? { uri: names.themeName === 'light' ? marker.marker[0] : marker.marker[1] }
                  : undefined
              }
            />
          )
        } else {
          return (
            <Marker
              key={`cluster-${marker.location.latitude},${marker.location.longitude}`}
              coordinate={marker.location}
              tracksViewChanges={false}
              image={
                Platform.OS === 'android'
                  ? { uri: names.themeName === 'light' ? marker.marker[0] : marker.marker[1] }
                  : undefined
              }
              onPress={() => onGoToLocation(marker.location.latitude, marker.location.longitude)}>
              {Platform.OS === 'ios' && (
                <ClusterMarker count={marker.count} borderColor={colors.markerBorder} />
              )}
            </Marker>
          )
        }
      })}
    </MapView>
  )
}

const s = StyleSheet.create({
  flexOne: { flex: 1 },
})
