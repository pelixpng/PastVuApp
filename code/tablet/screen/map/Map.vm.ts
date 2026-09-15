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
import * as PhotoPost from '../../../core/services/photoPost'
import { BaseViewModelProvider } from '../../provider/vm.provider'
import { SCREENS } from '../../navigation/navigation.types'
import { IComment, Users } from '../../../core/types/apiPhotoComment'
import { CollectionItem } from '../collection/Collection.screen'
import { Linking } from 'react-native'
import { savePhoto, sharePhoto } from '../../../core/utils/getPhoto'
import { t } from '../../../core/i18n'
import { defaultRegion } from '../../../core/constants/map'

export const mapRef = createRef<MapView>()

/** Matches `cameraZoomRange.minCenterCoordinateDistance` on the MapView. */
const MIN_ALTITUDE = 100

class MapVM extends BaseViewModelProvider<SCREENS.MAP> {
  //map data
  @observable.ref photoCollection: { markers: MapMarker[] } = { markers: [] }
  @observable.ref coordinates: Region = MMKVStorage.get('RegionString') ?? defaultRegion()
  @observable.ref yearsRange: YearsRangeType = MMKVStorage.get('RangeYears') ?? [1840, 2000]
  @observable queryPlace = ''
  @observable.ref places: LocationItem[] = []
  private timeoutId: ReturnType<typeof setTimeout> | null = null
  private collectionTimeoutId: ReturnType<typeof setTimeout> | null = null
  //photo detail
  @observable.ref comments: IComment[] = []
  @observable.ref users: Users | null = null
  @observable.ref postInfo: Photo | null = null
  @observable showPhotoDetail = false
  @observable isImageLoaded = false
  @observable activeCid: string | null = null
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

  @computed
  get imageResolution() {
    return this.postInfo ? PhotoPost.photoResolution(this.postInfo) : undefined
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
    const prev = this.coordinates
    // The map re-emits onRegionChangeComplete with an unchanged region when its view is
    // reattached (e.g. returning to the tab). `coordinates` is an observable.ref, so assigning an
    // equal-but-new object still counts as a change and makes the autorun refetch the markers,
    // which visibly redraws the whole map.
    if (
      prev &&
      prev.latitude === cord.latitude &&
      prev.longitude === cord.longitude &&
      prev.latitudeDelta === cord.latitudeDelta &&
      prev.longitudeDelta === cord.longitudeDelta
    ) {
      return
    }
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
      Alert.alert(t('common.error'), t('map.markersError'))
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
        Alert.alert(t('common.error'), t('map.searchLimit'))
      }
    }
  }

  // photo detail

  @action.bound
  async zoomToCluster(latitude: number, longitude: number) {
    const map = mapRef.current
    if (!map) return
    // Step from the camera's own zoom rather than from `getZoom(latitudeDelta)`: that helper
    // buckets the delta for the API's `z` parameter and reads about one level lower than the
    // camera actually is, so near zoom 17 it kept asking the camera to move where it already was
    // and tapping a cluster did nothing. Halving the altitude is one zoom level on iOS.
    const current = await map.getCamera()
    const step =
      Platform.OS === 'ios'
        ? { altitude: Math.max((current.altitude ?? zoomLevelToAltitude(16)) / 2, MIN_ALTITUDE) }
        : { zoom: (current.zoom ?? getZoom(this.coordinates.latitudeDelta)) + 1 }
    map.animateCamera(
      { center: { latitude, longitude }, heading: 0, pitch: 0, ...step },
      { duration: 500 },
    )
  }

  @action.bound
  showPhoto(cid: string, _title?: string) {
    this.showPhotoDetail = true
    this.activeCid = cid
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
      this.activeCid = null
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
    try {
      const { photo, users, comments } = await PhotoPost.loadPost(cid)
      // Another photo may have been opened, or the panel closed, while this request was in
      // flight; without this the slower, older response would overwrite the newer one.
      if (this.activeCid !== cid) return
      runInAction(() => {
        this.postInfo = photo
        this.users = users
        this.comments = comments
        this.isFavorite = PhotoPost.isFavorite(cid)
      })
      PhotoPost.recordHistory(photo, cid)
    } catch {
      Alert.alert(t('common.error'), t('photo.infoError'))
    }
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
