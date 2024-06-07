import { makeAutoObservable } from 'mobx'
import { MMKVStorage } from '../storage/Storage'

const PhotoQuality: { [key: string]: string } = {
  Миниатюра: 'h',
  Стандарт: 'd',
  Оригинал: 'a',
}

class SettingsPhotoStore {
  photoQualityTitle = MMKVStorage.get('photoQuality') ?? 'Оригинал'
  photoQualitySettings = PhotoQuality[this.photoQualityTitle]

  constructor() {
    makeAutoObservable(this)
  }

  changePhotoQuality = (value: string) => {
    this.photoQualityTitle = value
    this.photoQualitySettings = PhotoQuality[value]
    MMKVStorage.set('photoQuality', value)
  }
}

export default new SettingsPhotoStore()
