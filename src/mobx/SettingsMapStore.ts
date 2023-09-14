import { makeAutoObservable } from 'mobx'
import StorageServiceMMKV, { Storage } from '../Storage/Storage'

class SettingsMapStore {
	countPhoto = Storage.getNumber('countPhoto') ?? 30
	maxDistance = Storage.getNumber('MaxDistance') ?? 7000

	constructor() {
		makeAutoObservable(this)
	}

	changeCountPhoto = (value: number) => {
		this.countPhoto = value
		StorageServiceMMKV.saveApiCountPhoto(value[0])
	}

	changeDistancePhoto = (value: number) => {
		this.maxDistance = value
		StorageServiceMMKV.saveApiMaxDistance(value[0])
	}
}

export default new SettingsMapStore()
