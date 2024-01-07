import { makeAutoObservable } from 'mobx'
import StorageServiceMMKV, { Storage } from '../storage/Storage'

const Constant: { [key: string]: string } = {
	Миниатюра: 'h',
	Стандарт: 'd',
	Оригинал: 'a'
}

class SettingsPhotoStore {
	photoQualitySettings = Storage.getString('photoQuality') ?? 'a'
	photoQuality =
		Object.keys(Constant).find(
			key => Constant[key] === this.photoQualitySettings
		) ?? 'Оригинал'

	constructor() {
		makeAutoObservable(this)
	}

	changePhotoQuality = (value: string) => {
		this.photoQuality = value
		this.changePhotoQualitySettings(Constant[value])
	}

	changePhotoQualitySettings = (value: string) => {
		this.photoQualitySettings = value
		StorageServiceMMKV.savePhotoQualitySettings(value)
	}
}

export default new SettingsPhotoStore()
