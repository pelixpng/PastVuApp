import { action, computed, makeObservable } from 'mobx'
import { SCREENS } from '../../../navigation/navigation.types'
import { BaseViewModelProvider } from '../../../provider/vm.provider'
import MapStore from '../../../../core/store/Map.store'
import { NearbySearch } from '../../../../core/store/NearbySearch'
import { PhotoMap } from '../../../../core/store/PhotoMap'

class MapVM extends BaseViewModelProvider<SCREENS.MAP> {
	/** The map's area, years and markers, the place search and the camera. */
	readonly map = new PhotoMap()
	/** The nearby-photos sheet; it follows the map's centre and years while open. */
	readonly nearby: NearbySearch
	constructor() {
		super()
		makeObservable(this)
		this.nearby = new NearbySearch(
			() => this.map.coordinates,
			() => this.map.yearsRange
		)
	}

	// ------------------------------------------ Computed ------------------------------------------

	@computed
	get mapTypeSetting() {
		return MapStore.mapType
	}

	@computed
	get mapMarkerType() {
		return MapStore.markerType
	}

	/** The nearby-photos sheet is open; it stays so while another tab or a photo is in front. */
	get nearbyOpen() {
		return this.nearby.open
	}

	// ------------------------------------------ Actions ------------------------------------------

	@action.bound
	showPhoto(cid: string, title: string) {
		this.navigateTo(SCREENS.PHOTO_DETAIL, { cid: cid, title: title })
	}

	@action.bound
	toggleNearby() {
		this.nearby.toggle()
	}

	@action.bound
	closeNearby() {
		this.nearby.close()
	}
}

export default MapVM
