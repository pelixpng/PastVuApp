import { makeAutoObservable } from 'mobx'
import { MMKVStorage } from '../storage/Storage'
import { MapType } from 'react-native-maps'
import { Platform } from 'react-native'

const Maps: { [key: string]: MapType } = {
  Стандарт: 'standard',
  Спутник: 'satellite',
  Гибрид: 'hybrid',
  Рельеф: 'terrain',
}

class SettingsMapStore {
  countPhoto = MMKVStorage.get('countPhoto') ?? 30
  maxDistance = MMKVStorage.get('MaxDistance') ?? 7000
  maxPhotoOnMap = MMKVStorage.get('MaxPhoto') ?? 150
  mapTypeTitle = MMKVStorage.get('TypeMap') ?? 'Стандарт'
  mapTypeSetting = Maps[this.mapTypeTitle] ?? 'standard'
  markerType = MMKVStorage.get('TypeMarker') ?? 'Новый'
  mapProvider = MMKVStorage.get('mapProvider') ?? Platform.OS === 'android' ? 'Google' : 'Apple'
  showCluster = MMKVStorage.get('showCluster') ?? 'Да'
  constructor() {
    makeAutoObservable(this)
  }

  changeMapProvider = (value: string) => {
    this.mapProvider = value
    MMKVStorage.set('mapProvider', value)
  }

  changeMarkerType = (value: string) => {
    this.markerType = value
    MMKVStorage.set('TypeMarker', value)
  }

  changeMapType = (value: string) => {
    this.mapTypeTitle = value
    this.mapTypeSetting = Maps[value]
    MMKVStorage.set('TypeMap', value)
  }

  changeMaxPhotoMap = (value: number[]) => {
    this.maxPhotoOnMap = value[0]
    MMKVStorage.set('MaxPhoto', value[0])
  }

  changeCountPhoto = (value: number[]) => {
    this.countPhoto = value[0]
    MMKVStorage.set('countPhoto', value[0])
  }

  changeDistancePhoto = (value: number[]) => {
    this.maxDistance = value[0]
    MMKVStorage.set('MaxDistance', value[0])
  }

  changeShowCluster = (value: string) => {
    this.showCluster = value
    MMKVStorage.set('showCluster', value)
  }
}

export default new SettingsMapStore()
