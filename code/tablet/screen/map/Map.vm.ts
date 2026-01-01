import * as Location from 'expo-location'
import { action, autorun, computed, makeObservable, observable, reaction, runInAction } from 'mobx'
import { Alert, Keyboard, Platform } from 'react-native'
import MapView, { Region } from 'react-native-maps'
import { createRef } from 'react'
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
import { HistoryItem } from '../history/PhotoHistory.screen'
import { ExtensionStorage } from '@bacons/apple-targets'
import { savePhoto, sharePhoto } from '../../../core/utils/getPhoto'

const startRegion: Region = {
  latitude: 55.763307,
  longitude: 37.576945,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
}

export const mapRef = createRef<MapView>()

class MapVM extends BaseViewModelProvider<SCREENS.MAP> {
  //map data
  @observable.ref photoCollection: { markers: MapMarker[] } = { markers: [] }
  @observable.ref coordinates: Region = MMKVStorage.get('RegionString') ?? startRegion
  @observable.ref yearsRange: YearsRangeType = MMKVStorage.get('RangeYears') ?? [1840, 2000]
  @observable queryPlace = ''
  @observable.ref places: LocationItem[] = []
  private timeoutId: NodeJS.Timeout | null = null
  //photo detail
  @observable.ref comments: IComment[] = []
  @observable.ref users: Users | null = null
  @observable.ref postInfo: Photo | null = null
  @observable showPhotoDetail = false
  @observable isImageLoaded = false

  constructor() {
    super()
    autorun(() => {
      this.coordinates && this.getPhotoCollection()
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
  showPhoto(cid: string) {
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
        const history: HistoryItem[] = MMKVStorage.get('History') ?? []
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
  share() {
    sharePhoto(this.postInfo!.title, this.postInfo!.cid.toString())
  }

  @action.bound
  saveImage() {
    savePhoto(this.postInfo!.title, this.postInfo!.file)
  }
}

export default MapVM
