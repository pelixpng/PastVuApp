import { makeAutoObservable } from 'mobx'
import StorageServiceMMKV, { Storage } from '../storage/Storage'

const PhotoQuality: { [key: string]: string } = {
	Миниатюра: 'h',
	Стандарт: 'd',
	Оригинал: 'a'
}

class SettingsPhotoStore {
	photoQualityTitle = Storage.getString('photoQuality') ?? 'Оригинал'
	photoQualitySettings = PhotoQuality[this.photoQualityTitle]

	constructor() {
		makeAutoObservable(this)
	}

	changePhotoQuality = (value: string) => {
		this.photoQualityTitle = value
		this.photoQualitySettings = PhotoQuality[value]
		StorageServiceMMKV.savePhotoQualitySettings(value)
	}
}

export default new SettingsPhotoStore()
