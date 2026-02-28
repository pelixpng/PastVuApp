import * as Location from 'expo-location'
import { action, autorun, computed, makeObservable, observable, reaction, runInAction } from 'mobx'
import { Alert, Keyboard, Platform } from 'react-native'
import MapView, { Region } from 'react-native-maps'
import { YaMap } from 'react-native-yamap-lite'
import React, { createRef } from 'react'
import {
  getClustersPhotosProps,
  getPhotoListProps,
  LocationItem,
  MapMarker,
  PhotoMarker,
} from '../../../core/types/apiPhotoList'
import { MMKVStorage } from '../../../core/storage/mmkv'
import { YearsRangeType } from '../../../core/types/components'
import MapStore from '../../../core/store/Map.store'
import ApiStore from '../../../core/store/Api.store'
import { getPolygon, getZoom, zoomLevelToAltitude } from '../../../core/utils/getMapData'
import ApiService from '../../../core/api/apiService'
import { BaseViewModelProvider } from '../../provider/vm.provider'
import { SCREENS } from '../../navigation/navigation.types'
import { IComment, Users } from '../../../core/types/apiPhotoComment'
import { IosTargetStorage } from '../../../core/storage/appleTarget'
import { CollectionItem } from '../collection/Collection.screen'
import { ExtensionStorage } from '@bacons/apple-targets'
import { Linking } from 'react-native'
import { savePhoto, sharePhoto } from '../../../core/utils/getPhoto'

const startRegion: Region = {
  latitude: 55.763307,
  longitude: 37.576945,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
}

export const mapRef = createRef<MapView>()
export const yamapRef = createRef<React.ComponentRef<typeof YaMap>>()

class MapVM extends BaseViewModelProvider<SCREENS.MAP> {
  //map data
  @observable.ref photoCollection: { markers: MapMarker[] } = { markers: [] }
  @observable.ref coordinates: Region = MMKVStorage.get('RegionString') ?? startRegion
  @observable.ref yearsRange: YearsRangeType = MMKVStorage.get('RangeYears') ?? [1840, 2000]
  @observable queryPlace = ''
  @observable.ref places: LocationItem[] = []
  private timeoutId: NodeJS.Timeout | null = null
  private collectionTimeoutId: NodeJS.Timeout | null = null
  //photo detail
  @observable.ref comments: IComment[] = []
  @observable.ref users: Users | null = null
  @observable.ref postInfo: Photo | null = null
  @observable showPhotoDetail = false
  @observable isImageLoaded = false
  @observable isFavorite = false

  constructor() {
    super()
    autorun(() => {
      if (!this.coordinates) return
      if (this.collectionTimeoutId) clearTimeout(this.collectionTimeoutId)
      this.collectionTimeoutId = setTimeout(() => this.getPhotoCollection(), 300)
    })
    reaction(
      () => this.yearsRange,
      () => {
        runInAction(() => {
          this.photoCollection = { markers: [] }
          this.getPhotoCollection()
        })
      },
    )
    reaction(
      () => this.queryPlace,
      query => {
        if (query.length > 2) {
          if (this.timeoutId) clearTimeout(this.timeoutId)
          this.timeoutId = setTimeout(() => {
            this.findPlace()
          }, 500)
        }
      },
    )
    makeObservable(this)
  }

  // ------------------------------------------ Computed ------------------------------------------

  // map settings
  @computed
  get mapTypeSetting() {
    return MapStore.mapType
  }

  @computed
  get mapMarkerType() {
    return MapStore.markerType
  }

  // photo detail
  @computed
  get imageLink() {
    return `https://img.pastvu.com/${ApiStore.photoQualitySettings}/${this.postInfo?.file}`
  }

  // ------------------------------------------ Actions ------------------------------------------

  // map data
  @action.bound
  setYearsRange(years: [number, number]) {
    this.yearsRange = years
    MMKVStorage.set('RangeYears', years)
  }

  @action.bound
  setCoordinate(cord: Region) {
    this.coordinates = cord
    MMKVStorage.set('RegionString', this.coordinates)
  }

  @action.bound
  goToLocation(latitude: number, longitude: number) {
    Keyboard.dismiss()
    this.places = []
    const zoomLevel = ApiStore.showCluster ? getZoom(this.coordinates.latitudeDelta) + 1.2 : 14
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
    if (yamapRef.current) {
      yamapRef.current.setCenter({ lat: latitude, lon: longitude }, 16, 0, 0, 2000, 'SMOOTH')
    }
  }

  @action.bound
  async getCurrentLocation() {
    let { status } = await Location.requestForegroundPermissionsAsync()
    if (status === 'granted') {
      const lastPosition = await Location.getLastKnownPositionAsync()
      if (lastPosition) {
        this.goToLocation(lastPosition.coords.latitude, lastPosition.coords.longitude)
      } else {
        const { coords } = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Lowest,
        })
        this.goToLocation(coords.latitude, coords.longitude)
      }
    }
  }

  @action.bound
  async getPhotoCollection() {
    try {
      const zoom = getZoom(this.coordinates.latitudeDelta)
      if (ApiStore.showCluster === 'yes') {
        const paramsClustersApi: getClustersPhotosProps = {
          polygon: getPolygon(this.coordinates),
          latitude: this.coordinates.latitude,
          longitude: this.coordinates.longitude,
          yearStart: this.yearsRange[0],
          yearEnd: this.yearsRange[1],
          zoom,
        }
        const markers = await ApiService.getPhotosClusters(paramsClustersApi)
        this.photoCollection = { markers } // ← сразу единый массив
        return
      }
      if (this.photoCollection.markers.length > MapStore.maxPhotoOnMap) {
        this.photoCollection = { markers: [] }
      }
      const params: getPhotoListProps = {
        latitude: this.coordinates.latitude,
        longitude: this.coordinates.longitude,
        limit: ApiStore.requestCountPhoto,
        distance: ApiStore.maxDistance,
        yearStart: this.yearsRange[0],
        yearEnd: this.yearsRange[1],
      }
      const photoArray = await ApiService.getPhotoList(params)
      const newPhotos: PhotoMarker[] = photoArray.map(item => ({
        _type: 'photo',
        title: item.title,
        cid: item.cid,
        location: item.location,
        year: item.year,
        dir: item.dir,
        marker: item.marker,
        color: item.color,
      }))
      const uniquePhotos = newPhotos.filter(
        p =>
          !this.photoCollection.markers.some(prev => prev._type === 'photo' && prev.cid === p.cid),
      )
      this.photoCollection = {
        markers: [...this.photoCollection.markers, ...uniquePhotos],
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось загрузить метки')
    }
  }

  // find place

  @action.bound
  setQueryPlace(value: string) {
    runInAction(() => {
      if (value.length < 2) {
        this.places = []
      }
      this.queryPlace = value
    })
  }

  @action.bound
  async findPlace() {
    try {
      this.places = await ApiService.searchPlace(this.queryPlace)
    } catch (error: any) {
      if (error.message === '429') {
        Alert.alert(
          'Ошибка',
          'Лимит поиска для всех пользователей исчерпан. Попробуйте через пару минут или завтра 🪫',
        )
      }
    }
  }

  // photo detail

  @action.bound
  async zoomToCluster(latitude: number, longitude: number) {
    if (MapStore.mapProvider === 'yandex' && yamapRef.current) {
      const yaMapZoom = (await yamapRef.current.getCameraPosition()).zoom
      yamapRef.current.setCenter(
        { lat: latitude, lon: longitude },
        yaMapZoom + 1,
        0,
        0,
        1000,
        'SMOOTH',
      )
    } else {
      const currentZoom = getZoom(this.coordinates.latitudeDelta)
      const zoomLevel = currentZoom + 1
      const altitude = Platform.OS === 'ios' ? zoomLevelToAltitude(zoomLevel) : undefined
      const camera = {
        center: { latitude, longitude },
        heading: 0,
        pitch: 0,
        ...(Platform.OS === 'ios' ? { altitude } : { zoom: zoomLevel }),
      }
      if (mapRef.current) {
        mapRef.current.animateCamera(camera, { duration: 500 })
      }
    }
  }

  @action.bound
  showPhoto(cid: string, _title?: string) {
    this.showPhotoDetail = true
    if (this.postInfo) {
      runInAction(() => {
        this.postInfo = null
        this.comments = []
        this.users = null
        this.isImageLoaded = false
      })
    }
    this.getPhotoInfo(cid)
  }

  @action.bound
  closePhoto() {
    runInAction(() => {
      this.showPhotoDetail = false
      this.postInfo = null
      this.comments = []
      this.users = null
      this.isImageLoaded = false
    })
  }

  @action.bound
  openFullScreenImage() {
    this.navigateTo(SCREENS.FULL_SCREEN_IMAGE, {
      title: this.postInfo!.title,
      cid: this.postInfo!.cid.toString(),
      uri: this.imageLink,
      file: this.postInfo!.file,
    })
  }

  @action.bound
  async getPhotoInfo(cid: string) {
    await ApiService.getPhotoInfo(cid)
      .then(async ({ result }) => {
        this.postInfo = result.photo
        const favorites: CollectionItem[] = MMKVStorage.get('Favorites') ?? []
        this.isFavorite = favorites.some(item => item.cid === cid)
        const history: CollectionItem[] = MMKVStorage.get('History') ?? []
        const title = result.photo.title
        const description = `${result.photo.y} ${result.photo.regions
          .map(region => region.title_local)
          .join(', ')}`
        const file = result.photo.file
        if (!history.some(item => item.cid === cid)) {
          MMKVStorage.set('History', [{ title, description, cid, file }, ...history])
          IosTargetStorage.set(
            'History',
            JSON.stringify([{ title, description, cid, file }, ...history]),
          )
          ExtensionStorage.reloadWidget()
        }
        if (result.photo?.ccount) {
          this.getComments(cid)
        }
      })
      .catch(() => Alert.alert('Ошибка', 'Не удалось загрузить информацию о фото'))
  }

  @action.bound
  async getComments(cid: string) {
    await ApiService.getComments(cid).then(({ users, comments }) => {
      runInAction(() => {
        this.users = users
        this.comments = comments
      })
    })
  }

  @action.bound
  onImageLoad() {
    this.isImageLoaded = true
  }

  @action.bound
  toggleFavorite() {
    const cid = this.postInfo!.cid.toString()
    const favorites: CollectionItem[] = MMKVStorage.get('Favorites') ?? []
    const title = this.postInfo!.title
    const description = `${this.postInfo!.y} ${this.postInfo!.regions.map(
      region => region.title_local,
    ).join(', ')}`
    const file = this.postInfo!.file

    if (this.isFavorite) {
      const updatedFavorites = favorites.filter(item => item.cid !== cid)
      MMKVStorage.set('Favorites', updatedFavorites)
      this.isFavorite = false
    } else {
      MMKVStorage.set('Favorites', [{ title, description, cid, file }, ...favorites])
      this.isFavorite = true
    }
  }

  @action.bound
  openPhotoFromLink(href: string) {
    const photoMatch = href.match(/\/p\/(\d+)/)
    if (photoMatch) {
      this.showPhoto(photoMatch[1])
    } else {
      Linking.openURL(href)
    }
  }

  @action.bound
  share() {
    sharePhoto(this.postInfo!.title, this.postInfo!.cid.toString())
  }

  @action.bound
  saveImage() {
    savePhoto(this.postInfo!.title, this.postInfo!.file)
  }
}

export default MapVM
