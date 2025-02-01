import MapView, { Marker } from 'react-native-maps'
import { Platform, StyleSheet, View } from 'react-native'
import { DefaultTheme, useTheme } from 'styled-components/native'
import { useVM } from '../../../hooks/useVM'
import MapVM, { mapRef } from './Map.vm'
import { SearchPlace } from './components/searchPlase/SearchPlace'
import { LocationButton } from './components/LocationButton'
import { ClusterMarker } from './components/markers/ClusterMarker'
import { YearsSlider } from './components/yearsSlider/YearsSlider'
import { observer } from 'mobx-react'

export const MapScreen = observer(() => {
  const vm = useVM(MapVM)
  const theme: DefaultTheme = useTheme()
  return (
    <View style={s.block}>
      <SearchPlace goToLocation={vm.goToLocation} />
      <MapView
        ref={mapRef}
        style={s.map}
        userInterfaceStyle={theme.names.themeName}
        customMapStyle={theme.colors.MapTheme}
        onRegionChangeComplete={vm.setCoordinate}
        showsUserLocation={true}
        showsMyLocationButton={false}
        initialRegion={vm.coordinates}
        showsPointsOfInterest={false}
        loadingBackgroundColor={theme.colors.backgroundApp}
        moveOnMarkerPress={false}
        rotateEnabled={false}
        cameraZoomRange={{
          minCenterCoordinateDistance: 100,
          maxCenterCoordinateDistance: 10000000,
          animated: false,
        }}
        mapType={vm.mapTypeSetting}>
        {vm.photoCollection.photos?.map(marker => (
          <Marker
            key={marker.cid}
            coordinate={marker.location}
            tracksViewChanges={false}
            rotation={marker.dir}
            pinColor={marker.color}
            onPress={() => vm.showPhoto(marker.cid, marker.title)}
            style={Platform.OS === 'ios' && { transform: [{ rotate: `${marker.dir}deg` }] }}
            image={
              vm.mapMarkerType === 'new'
                ? theme.names.themeName === 'light'
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
            onPress={() => vm.goToLocation(marker.location.latitude, marker.location.longitude)}>
            <ClusterMarker count={marker.count} borderColor={theme.colors.markerBorder} />
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
    height: '100%',
    width: '100%',
    position: 'absolute',
  },
})
