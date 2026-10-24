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
	/**
	 * The user agreed to what Yandex collects (its terms, 8.1: IP address, device ID, location),
	 * asked once, when Yandex Maps is first chosen in the settings.
	 */
	@observable yandexConsent: boolean = MMKVStorage.get('yandexConsent') === 'yes'

	constructor() {
		makeObservable(this)
		// Yandex picked before 2.7.0 was never asked about: back to the default, so the consent
		// sheet shows the next time Yandex is chosen.
		if (this.mapProvider === 'yandex' && !this.yandexConsent) {
			this.setMapProvider(defaultMapProvider)
		}
		// Apple Maps has no terrain type, so the option is hidden on iOS and would leave the list
		// with nothing selected.
		if (Platform.OS === 'ios' && this.mapType === 'terrain') {
			this.setMapType('standard')
		}
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
	acceptYandex = () => {
		this.yandexConsent = true
		MMKVStorage.set('yandexConsent', 'yes')
		this.setMapProvider('yandex')
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
