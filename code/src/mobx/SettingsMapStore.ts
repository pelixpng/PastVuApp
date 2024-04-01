import { makeAutoObservable } from 'mobx'
import StorageServiceMMKV, { Storage } from '../storage/Storage'
import { MapType } from 'react-native-maps'

const Maps: { [key: string]: MapType } = {
  Стандарт: 'standard',
  Спутник: 'satellite',
  Гибрид: 'hybrid',
  Рельеф: 'terrain',
}

class SettingsMapStore {
  countPhoto = Storage.getNumber('countPhoto') ?? 30
  maxDistance = Storage.getNumber('MaxDistance') ?? 7000
  maxPhotoOnMap = Storage.getNumber('MaxPhoto') ?? 150
  mapTypeTitle = Storage.getString('TypeMap') ?? 'Стандарт'
  mapTypeSetting = Maps[this.mapTypeTitle] ?? 'standard'
  markerType = Storage.getString('TypeMarker') ?? 'Новый'
  constructor() {
    makeAutoObservable(this)
  }

  changeMarkerType = (value: string) => {
    this.markerType = value
    StorageServiceMMKV.saveTypeMarker(value)
  }

  changeMapType = (value: string) => {
    this.mapTypeTitle = value
    this.mapTypeSetting = Maps[value]
    StorageServiceMMKV.saveTypeMap(value)
  }

  changeMaxPhotoMap = (value: number[]) => {
    this.maxPhotoOnMap = value[0]
    StorageServiceMMKV.saveMaxPhotoOnMap(value[0])
  }

  changeCountPhoto = (value: number[]) => {
    this.countPhoto = value[0]
    StorageServiceMMKV.saveApiCountPhoto(value[0])
  }

  changeDistancePhoto = (value: number[]) => {
    this.maxDistance = value[0]
    StorageServiceMMKV.saveApiMaxDistance(value[0])
  }
}

export default new SettingsMapStore()
