import { FC } from 'react'
import MapView, { Marker, Region } from 'react-native-maps'
import { DefaultTheme, useTheme } from 'styled-components'
import { itemPhotoArray } from '../../types/apiPhotoList'
import { observer } from 'mobx-react-lite'
import SettingsMapStore from '../../mobx/SettingsMapStore'
import { StyleSheet } from 'react-native'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { RootStackParamList } from '../../types/navigation'

type MapProp = {
  setCoordinates: (region: Region) => void
  coordinates: Region
  items: itemPhotoArray[]
}

export const GoogleMap: FC<MapProp> = observer(({ setCoordinates, coordinates, items }) => {
  const theme: DefaultTheme = useTheme()
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()
  const { mapTypeSetting, markerType, mapProvider } = SettingsMapStore
  return (
    <MapView
      style={s.map}
      //provider={PROVIDER_GOOGLE}
      userInterfaceStyle={theme.names.themeName}
      customMapStyle={theme.colors.MapTheme}
      onRegionChangeComplete={setCoordinates}
      showsUserLocation={true}
      showsMyLocationButton={false}
      initialRegion={coordinates}
      region={coordinates}
      showsPointsOfInterest={false}
      loadingBackgroundColor={theme.colors.backgroundApp}
      moveOnMarkerPress={false}
      rotateEnabled={false}
      mapType={mapTypeSetting}>
      {items.map((marker, index) => (
        <Marker
          key={index}
          coordinate={marker.location}
          title={mapProvider === 'Google' ? marker.title : undefined}
          tracksViewChanges={false}
          rotation={marker.dir}
          pinColor={marker.color}
          onPress={() => navigation.navigate('PhotoPage', { cid: marker.cid })}
          style={mapProvider === 'Apple' && { transform: [{ rotate: `${marker.dir}deg` }] }}
          image={
            markerType === 'Новый'
              ? theme.names.themeName == 'light'
                ? marker.marker[0]
                : marker.marker[1]
              : undefined
          }
        />
      ))}
    </MapView>
  )
})

const s = StyleSheet.create({
  map: {
    height: '100%',
    width: '100%',
    position: 'absolute',
  },
})
