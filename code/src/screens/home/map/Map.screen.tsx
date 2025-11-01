import MapView, { Marker } from 'react-native-maps'
import { Platform, StyleSheet, View } from 'react-native'
import { useVM } from '../../../hooks/useVM'
import MapVM, { mapRef } from './Map.vm'
import { LocationButton } from './components/LocationButton'
import { ClusterMarker } from './components/markers/ClusterMarker'
import { YearsSlider } from './components/yearsSlider/YearsSlider'
import { observer } from 'mobx-react'
import { SearchPlace } from './components/searchPlace/SearchPlace'
import { SIZE } from '../../../constants/sizes'
import { useTheme } from '@react-navigation/native'

export const MapScreen = observer(() => {
  const vm = useVM(MapVM)
  const { colors, names } = useTheme()
  return (
    <View style={s.block}>
      <SearchPlace
        places={vm.places}
        query={vm.queryPlace}
        setQueryPlace={vm.setQueryPlace}
        goToLocation={vm.goToLocation}
      />
      <MapView
        ref={mapRef}
        style={s.map}
        userInterfaceStyle={names.themeName}
        customMapStyle={colors.MapTheme}
        onRegionChangeComplete={vm.setCoordinate}
        showsUserLocation={true}
        showsMyLocationButton={false}
        initialRegion={vm.coordinates}
        showsPointsOfInterest={false}
        loadingBackgroundColor={colors.backgroundApp}
        moveOnMarkerPress={false}
        rotateEnabled={false}
        cameraZoomRange={{
          minCenterCoordinateDistance: 100,
          maxCenterCoordinateDistance: 10000000,
          animated: false,
        }}
        mapType={vm.mapTypeSetting}>
        {vm.photoCollection.photos?.map((marker, index) => (
          <Marker
            key={index}
            coordinate={marker.location}
            tracksViewChanges={false}
            rotation={marker.dir}
            pinColor={marker.color}
            onPress={() => vm.showPhoto(marker.cid, marker.title)}
            style={
              Platform.OS === 'ios' && {
                transform: [{ rotate: `${marker.dir}deg` }],
              }
            }
            image={
              vm.mapMarkerType === 'new'
                ? names.themeName === 'light'
                  ? marker.marker[0]
                  : marker.marker[1]
                : undefined
            }
          />
        ))}
        {vm.photoCollection.clusters.map((marker, index) => (
          <Marker
            key={index}
            coordinate={marker.location}
            tracksViewChanges={false}
            image={names.themeName === 'light' ? marker.marker[0] : marker.marker[1]}
            onPress={() => vm.goToLocation(marker.location.latitude, marker.location.longitude)}>
            {Platform.OS === 'ios' && (
              <ClusterMarker count={marker.count} borderColor={colors.markerBorder} />
            )}
          </Marker>
        ))}
      </MapView>
      <LocationButton onPress={vm.getCurrentLocation} />
      <YearsSlider value={vm.yearsRange} setValue={vm.setYearsRange} />
    </View>
  )
})

const s = StyleSheet.create({
  block: { flex: 1 },
  map: {
    width: SIZE.SCREEN_WIDTH,
    height: SIZE.SCREEN_HEIGHT,
  },
})
