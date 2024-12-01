import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import MapView, { Marker, Region } from 'react-native-maps'
import ApiService from '../../api/PastVuApi'
import { observer } from 'mobx-react-lite'
import { YearsSlider } from '../../components/sliders/YearsSlider/YearsSlider'
import { MMKVStorage } from '../../storage/Storage'
import { SearchPlace } from '../../components/map/searchPlase/SearchPlace'
import {
  getClustersPhotosProps,
  getPhotoListProps,
  itemPhotoArray,
  itemPhotoCluster,
} from '../../types/apiPhotoList'
import { YearsRangeType } from '../../types/components'
import { Alert, Platform, StyleSheet, View } from 'react-native'
import * as Location from 'expo-location'
import { LocationButton } from '../../components/ui/buttons/LocationButton'
import { getPolygon, getZoom, zoomLevelToAltitude } from '../../utils/getMapData'
import { ClusterMarker } from '../../components/map/markers/ClusterMarker'
import SettingsMapStore from '../../mobx/SettingsMapStore'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { RootStackParamList } from '../../types/navigation'
import { DefaultTheme, useTheme } from 'styled-components/native'

const loc: Region = {
  latitude: 55.763307,
  longitude: 37.576945,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
}

export const MapComponent = observer(() => {
  const saveRangeYears = MMKVStorage.get('RangeYears')
  const saveRegion = MMKVStorage.get('RegionString')
  const mapRef = useRef<MapView | null>(null)
  const [items, setItems] = useState<itemPhotoCluster>({ photos: [], clusters: [] })
  const [coordinates, setCoordinates] = useState<Region>(saveRegion ?? loc)
  const [yearsRange, setYearsRange] = useState<YearsRangeType>(saveRangeYears ?? [1840, 1916])
  const theme: DefaultTheme = useTheme()
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()
  const {
    mapTypeSetting,
    markerType,
    mapProvider,
    showCluster,
    maxPhotoOnMap,
    countPhoto,
    maxDistance,
  } = SettingsMapStore

  const handleMarkerPress = useCallback(
    (cid: string) => navigation.navigate('PhotoPage', { cid }),
    [navigation],
  )

  const goToLocation = (latitude: number, longitude: number, isCluster?: boolean) => {
    const zoomLevel = isCluster ? getZoom(coordinates.latitudeDelta) + 1.2 : 14
    const altitude = Platform.OS === 'ios' ? zoomLevelToAltitude(zoomLevel) : undefined
    const camera = {
      center: {
        latitude,
        longitude,
      },
      heading: 0,
      pitch: 0,
      ...(Platform.OS === 'ios' ? { altitude } : { zoom: zoomLevel }),
    }
    if (mapRef.current) {
      mapRef.current.animateCamera(camera, { duration: 2000 })
    }
  }

  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync()
    if (status === 'granted') {
      const lastPosition = await Location.getLastKnownPositionAsync()
      if (lastPosition) {
        goToLocation(lastPosition.coords.latitude, lastPosition.coords.longitude)
      } else {
        const { coords } = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Lowest,
        })
        goToLocation(coords.latitude, coords.longitude)
      }
    }
  }

  useEffect(() => {
    if (!saveRegion) getLocation()
  }, [])

  async function getPhoto() {
    try {
      if (showCluster === 'Да') {
        const paramsClustersApi: getClustersPhotosProps = {
          polygon: getPolygon(coordinates),
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          yearStart: yearsRange[0],
          yearEnd: yearsRange[1],
          zoom: getZoom(coordinates.latitudeDelta),
        }
        const newJSON = await ApiService.getPhotosClusters(paramsClustersApi)
        setItems(newJSON)
      } else {
        items.photos.length > maxPhotoOnMap && setItems({ photos: [], clusters: [] })
        const params: getPhotoListProps = {
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          limit: countPhoto,
          distance: maxDistance,
          yearStart: yearsRange[0],
          yearEnd: yearsRange[1],
        }
        const photoArray: itemPhotoArray[] = await ApiService.getPhotoList(params)
        setItems(prevItems => {
          const newPhotos = photoArray.map(item => ({
            title: item.title,
            cid: item.cid,
            location: {
              latitude: item.location.latitude,
              longitude: item.location.longitude,
            },
            year: item.year,
            dir: item.dir,
            marker: item.marker,
            color: item.color,
          }))
          const uniquePhotos = newPhotos.filter(newPhoto =>
            prevItems.photos.every(prevPhoto => prevPhoto.cid !== newPhoto.cid),
          )
          return {
            photos: [...prevItems.photos, ...uniquePhotos],
            clusters: [],
          }
        })
      }
      MMKVStorage.set('RegionString', coordinates)
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось загрузить метки')
    }
  }

  useMemo(() => {
    getPhoto()
  }, [coordinates])

  useMemo(() => {
    setItems({ clusters: [], photos: [] })
    getPhoto()
  }, [yearsRange])

  return (
    <View style={s.block}>
      <SearchPlace setCoordinates={goToLocation} />
      <MapView
        ref={mapRef}
        style={s.map}
        userInterfaceStyle={theme.names.themeName}
        customMapStyle={theme.colors.MapTheme}
        onRegionChangeComplete={setCoordinates}
        showsUserLocation={true}
        showsMyLocationButton={false}
        initialRegion={coordinates}
        showsPointsOfInterest={false}
        loadingBackgroundColor={theme.colors.backgroundApp}
        moveOnMarkerPress={false}
        rotateEnabled={false}
        cameraZoomRange={{
          minCenterCoordinateDistance: 100,
          maxCenterCoordinateDistance: 10000000,
          animated: false,
        }}
        mapType={mapTypeSetting}>
        {items.photos?.map((marker, index) => (
          <Marker
            key={index}
            coordinate={marker.location}
            title={mapProvider === 'Google' ? marker.title : undefined}
            tracksViewChanges={false}
            rotation={marker.dir}
            pinColor={marker.color}
            onPress={() => handleMarkerPress(marker.cid)}
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
        {items.clusters.map((marker, index) => (
          <Marker
            key={index}
            coordinate={marker.location}
            tracksViewChanges={false}
            onPress={() => goToLocation(marker.location.latitude, marker.location.longitude, true)}>
            <ClusterMarker count={marker.count} borderColor={theme.colors.markerBorder} />
          </Marker>
        ))}
      </MapView>
      <LocationButton onPress={getLocation} />
      <YearsSlider value={yearsRange} setValue={setYearsRange} />
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
