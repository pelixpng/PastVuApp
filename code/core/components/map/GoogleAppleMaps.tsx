import MapView, { Marker, MapType, Region } from 'react-native-maps'
import { Platform, StyleSheet } from 'react-native'
import { RefObject } from 'react'
import { useTheme } from '@react-navigation/native'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { MapMarker } from '../../types/apiPhotoList'
import { markerKey } from '../../services/mapMarkers'
import { ClusterMarker } from './ClusterMarker'
import { YEARS_SLIDER_HEIGHT } from './YearsSlider'

// MapKit draws the logo about 10 pt inside the margin; this puts it 16 pt from the edge, like the
// Yandex logo.
const APPLE_LOGO_LEFT = 6
// On tablets the logo sits over the slider panel's rounded corner. In line with the panel's
// straight edge the apple looked like it stuck out past the corner, so it goes a little further in.
const TABLET_LOGO_INSET = 4

type Props = {
  mapRef: RefObject<MapView | null>
  markers: MapMarker[]
  mapType: MapType
  mapMarkerType: string
  initialRegion: Region
  onRegionChangeComplete: (region: Region) => void
  onShowPhoto: (cid: string, title: string) => void
  onGoToLocation: (lat: number, lng: number) => void
  isTablet?: boolean
  /**
   * How far up from the map's bottom edge something covers it, in points, when that is more than
   * the years slider (and the tab bar under it on tablets): the nearby-photos sheet. The
   * attribution goes just above it.
   */
  bottomInset?: number
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
  isTablet,
  bottomInset,
}: Props) => {
  const { colors, names } = useTheme()
  const tabBarHeight = useBottomTabBarHeight()
  const { bottom: safeBottom } = useSafeAreaInsets()
  // Apple's terms require the Apple Maps logo and its legal link to stay visible. MapKit draws
  // them in the bottom-left corner, inside the map's layout margins, which is where the years
  // slider covers them; on tablets, the slider and the tab bar under it. The margins lift them
  // just above the slider, where the Yandex logo sits too. On tablets the map runs under the tab
  // bar down to the home indicator, whose safe area MapKit already keeps clear on its own.
  const attributionPadding =
    Platform.OS === 'ios'
      ? {
          top: 0,
          right: 0,
          left: isTablet ? APPLE_LOGO_LEFT + TABLET_LOGO_INSET : APPLE_LOGO_LEFT,
          bottom: isTablet
            ? (bottomInset ?? tabBarHeight + YEARS_SLIDER_HEIGHT) - safeBottom
            : (bottomInset ?? YEARS_SLIDER_HEIGHT),
        }
      : undefined

  return (
    <MapView
      ref={mapRef}
      style={s.flexOne}
      mapPadding={attributionPadding}
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
              key={markerKey(marker)}
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
              key={markerKey(marker)}
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
