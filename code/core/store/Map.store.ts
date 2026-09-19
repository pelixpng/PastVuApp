import { MMKVStorage } from '../storage/mmkv'
import { action, makeObservable, observable } from 'mobx'
import { Platform } from 'react-native'

/** Which SDK draws the map: the platform default, or Yandex MapKit when a key is configured. */
export type MapProvider = 'apple' | 'google' | 'yandex'

export const defaultMapProvider: MapProvider =
	Platform.OS === 'ios' ? 'apple' : 'google'

class MapStore {
	@observable markerType = MMKVStorage.get('markerType') ?? 'new'
	@observable mapType = MMKVStorage.get('mapType') ?? 'standard'
	@observable maxPhotoOnMap = MMKVStorage.get('MaxPhoto') ?? 150
	@observable mapProvider: MapProvider =
		MMKVStorage.get('mapProvider') ?? defaultMapProvider

	constructor() {
		makeObservable(this)
	}

	@action.bound
	setMapType = (value: string) => {
		this.mapType = value
		MMKVStorage.set('mapType', value)
	}

	@action.bound
	setMapProvider = (value: string) => {
		this.mapProvider = value as MapProvider
		MMKVStorage.set('mapProvider', value)
	}

	@action.bound
	setMarkerType = (value: string) => {
		this.markerType = value
		MMKVStorage.set('markerType', value)
	}

	@action.bound
	setMaxPhotoMap = (value: number[]) => {
		this.maxPhotoOnMap = value[0]
		MMKVStorage.set('MaxPhoto', value[0])
	}
}

export default new MapStore()
