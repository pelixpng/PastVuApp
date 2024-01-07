import { makeAutoObservable } from 'mobx'
import StorageServiceMMKV, { Storage } from '../storage/Storage'

class SettingsMapStore {
	countPhoto = Storage.getNumber('countPhoto') ?? 30
	maxDistance = Storage.getNumber('MaxDistance') ?? 7000
	maxPhotoOnMap = Storage.getNumber('MaxPhoto') ?? 150 //добавить проверку на платформу

	constructor() {
		makeAutoObservable(this)
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
