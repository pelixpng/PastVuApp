import { action, computed, makeObservable, observable } from 'mobx'
import MapStore from '../../../core/store/Map.store'
import { userLoginFromLink } from '../../../core/utils/userLink'
import { BaseViewModelProvider } from '../../provider/vm.provider'
import { SCREENS } from '../../navigation/navigation.types'
import { Linking } from 'react-native'
import { PhotoPanel } from '../../../core/store/PhotoPanel'
import { NearbySearch } from '../../../core/store/NearbySearch'
import { PhotoMap } from '../../../core/store/PhotoMap'

class MapVM extends BaseViewModelProvider<SCREENS.MAP> {
	//map data
	/** The map's area, years and markers, the place search and the camera. */
	readonly map = new PhotoMap()
	/** The nearby-photos sheet in the left column; it follows the map's centre and years while open. */
	readonly nearby: NearbySearch
	//photo detail
	@observable showPhotoDetail = false
	/** The post panel over the map; a marker tapped again loads its photo again. */
	readonly panel = new PhotoPanel({
		openFullScreen: params => this.navigateTo(SCREENS.FULL_SCREEN_IMAGE, params)
	})

	constructor() {
		super()
		makeObservable(this)
		this.nearby = new NearbySearch(
			() => this.map.coordinates,
			() => this.map.yearsRange
		)
	}

	// ------------------------------------------ Computed ------------------------------------------

	// map settings
	@computed
	get mapTypeSetting() {
		return MapStore.mapType
	}

	@computed
	get mapMarkerType() {
		return MapStore.markerType
	}

	// ------------------------------------------ Actions ------------------------------------------

	// photo detail

	@action.bound
	showPhoto(cid: string, _title?: string) {
		this.showPhotoDetail = true
		this.panel.show(cid)
	}

	@action.bound
	closePhoto() {
		this.showPhotoDetail = false
		this.panel.close()
	}

	@action.bound
	openPhotoFromLink(href: string) {
		const photoMatch = href.match(/\/p\/(\d+)/)
		if (photoMatch) {
			this.showPhoto(photoMatch[1])
		} else {
			const login = userLoginFromLink(href)
			if (login) {
				this.pushTo(SCREENS.PROFILE, { login })
			} else {
				Linking.openURL(href)
			}
		}
	}
}

export default MapVM
