import * as Location from 'expo-location'
import {
	action,
	autorun,
	computed,
	makeObservable,
	observable,
	reaction,
	runInAction
} from 'mobx'
import { Alert, Keyboard, Platform } from 'react-native'
import MapView, { Region } from 'react-native-maps'
import { SCREENS } from '../../../navigation/navigation.types'
import { createRef } from 'react'
import type { YaMapRef } from 'react-native-yamap-lite'
import { BaseViewModelProvider } from '../../../provider/vm.provider'
import {
	getClustersPhotosProps,
	getPhotoListProps,
	LocationItem,
	MapMarker,
	PhotoMarker
} from '../../../../core/types/apiPhotoList'
import { MMKVStorage } from '../../../../core/storage/mmkv'
import { YearsRangeType } from '../../../../core/types/components'
import MapStore from '../../../../core/store/Map.store'
import ApiStore from '../../../../core/store/Api.store'
import {
	getPolygon,
	getZoom,
	zoomLevelToAltitude
} from '../../../../core/utils/getMapData'
import ApiService from '../../../../core/api/apiService'
import { dedupeMarkers } from '../../../../core/services/mapMarkers'
import { t } from '../../../../core/i18n'
import { defaultRegion } from '../../../../core/constants/map'

export const mapRef = createRef<MapView>()
/** The Yandex map, when that provider is selected; only one of the two refs is mounted. */
export const yamapRef = createRef<YaMapRef>()

/** Matches `cameraZoomRange.minCenterCoordinateDistance` on the MapView. */
const MIN_ALTITUDE = 100

class MapVM extends BaseViewModelProvider<SCREENS.MAP> {
	@observable.ref photoCollection: { markers: MapMarker[] } = { markers: [] }
	@observable.ref coordinates: Region =
		MMKVStorage.get('RegionString') ?? defaultRegion()
	@observable.ref yearsRange: YearsRangeType = MMKVStorage.get(
		'RangeYears'
	) ?? [1840, 2000]
	@observable.ref places: LocationItem[] = []
	@observable queryPlace = ''
	private timeoutId: ReturnType<typeof setTimeout> | null = null
	private collectionTimeoutId: ReturnType<typeof setTimeout> | null = null
	constructor() {
		super()
		autorun(() => {
			if (!this.coordinates) return
			if (this.collectionTimeoutId) clearTimeout(this.collectionTimeoutId)
			this.collectionTimeoutId = setTimeout(
				() => this.getPhotoCollection(),
				300
			)
		})
		reaction(
			() => this.yearsRange,
			() => {
				runInAction(() => {
					this.photoCollection = { markers: [] }
					this.getPhotoCollection()
				})
			}
		)
		reaction(
			() => this.queryPlace,
			query => {
				if (query.length > 2) {
					if (this.timeoutId) clearTimeout(this.timeoutId)
					this.timeoutId = setTimeout(() => {
						this.findPlace()
					}, 500)
				}
			}
		)
		makeObservable(this)
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

	// ------------------------------------------ Actions ------------------------------------------

	@action.bound
	setYearsRange(years: [number, number]) {
		this.yearsRange = years
		MMKVStorage.set('RangeYears', years)
	}

	@action.bound
	setCoordinate(cord: Region) {
		const prev = this.coordinates
		// The map re-emits onRegionChangeComplete with an unchanged region when its view is
		// reattached (e.g. returning to the tab). `coordinates` is an observable.ref, so assigning an
		// equal-but-new object still counts as a change and makes the autorun refetch the markers,
		// which visibly redraws the whole map.
		if (
			prev &&
			prev.latitude === cord.latitude &&
			prev.longitude === cord.longitude &&
			prev.latitudeDelta === cord.latitudeDelta &&
			prev.longitudeDelta === cord.longitudeDelta
		) {
			return
		}
		this.coordinates = cord
		MMKVStorage.set('RegionString', this.coordinates)
	}

	@action.bound
	showPhoto(cid: string, title: string) {
		this.navigateTo(SCREENS.PHOTO_DETAIL, { cid: cid, title: title })
	}

	@action.bound
	setQueryPlace(value: string) {
		runInAction(() => {
			if (value.length < 2) {
				this.places = []
			}
			this.queryPlace = value
		})
	}

	@action.bound
	goToLocation(latitude: number, longitude: number) {
		Keyboard.dismiss()
		this.places = []
		const zoomLevel = 16
		const altitude =
			Platform.OS === 'ios' ? zoomLevelToAltitude(zoomLevel) : undefined
		const camera = {
			center: {
				latitude,
				longitude
			},
			heading: 0,
			pitch: 0,
			...(Platform.OS === 'ios' ? { altitude } : { zoom: zoomLevel })
		}
		if (MapStore.mapProvider === 'yandex') {
			yamapRef.current?.setCenter(
				{ lat: latitude, lon: longitude },
				16,
				0,
				0,
				2000,
				'SMOOTH'
			)
			return
		}
		if (mapRef.current) {
			mapRef.current.animateCamera(camera, { duration: 2000 })
		}
	}

	@action.bound
	async zoomToCluster(latitude: number, longitude: number) {
		if (MapStore.mapProvider === 'yandex') {
			const yamap = yamapRef.current
			if (!yamap) return
			const { zoom } = await yamap.getCameraPosition()
			yamap.setCenter(
				{ lat: latitude, lon: longitude },
				zoom + 1,
				0,
				0,
				500,
				'SMOOTH'
			)
			return
		}
		const map = mapRef.current
		if (!map) return
		// Step from the camera's own zoom rather than from `getZoom(latitudeDelta)`: that helper
		// buckets the delta for the API's `z` parameter and reads about one level lower than the
		// camera actually is, so near zoom 17 it kept asking the camera to move where it already was
		// and tapping a cluster did nothing. Halving the altitude is one zoom level on iOS.
		const current = await map.getCamera()
		const step =
			Platform.OS === 'ios'
				? {
						altitude: Math.max(
							(current.altitude ?? zoomLevelToAltitude(16)) / 2,
							MIN_ALTITUDE
						)
					}
				: {
						zoom: (current.zoom ?? getZoom(this.coordinates.latitudeDelta)) + 1
					}
		map.animateCamera(
			{ center: { latitude, longitude }, heading: 0, pitch: 0, ...step },
			{ duration: 500 }
		)
	}

	@action.bound
	async getCurrentLocation() {
		let { status } = await Location.requestForegroundPermissionsAsync()
		if (status === 'granted') {
			const lastPosition = await Location.getLastKnownPositionAsync()
			if (lastPosition) {
				this.goToLocation(
					lastPosition.coords.latitude,
					lastPosition.coords.longitude
				)
			} else {
				const { coords } = await Location.getCurrentPositionAsync({
					accuracy: Location.Accuracy.Lowest
				})
				this.goToLocation(coords.latitude, coords.longitude)
			}
		}
	}

	@action.bound
	async getPhotoCollection() {
		try {
			const zoom = getZoom(this.coordinates.latitudeDelta)
			if (ApiStore.showCluster === 'yes') {
				const paramsClustersApi: getClustersPhotosProps = {
					polygon: getPolygon(this.coordinates),
					latitude: this.coordinates.latitude,
					longitude: this.coordinates.longitude,
					yearStart: this.yearsRange[0],
					yearEnd: this.yearsRange[1],
					zoom
				}
				const markers = await ApiService.getPhotosClusters(paramsClustersApi)
				this.photoCollection = { markers: dedupeMarkers(markers) }
				return
			}
			if (this.photoCollection.markers.length > MapStore.maxPhotoOnMap) {
				this.photoCollection = { markers: [] }
			}
			const params: getPhotoListProps = {
				latitude: this.coordinates.latitude,
				longitude: this.coordinates.longitude,
				limit: ApiStore.requestCountPhoto,
				distance: ApiStore.maxDistance,
				yearStart: this.yearsRange[0],
				yearEnd: this.yearsRange[1]
			}
			const photoArray = await ApiService.getPhotoList(params)
			const newPhotos: PhotoMarker[] = photoArray.map(item => ({
				_type: 'photo',
				title: item.title,
				cid: item.cid,
				location: item.location,
				year: item.year,
				dir: item.dir,
				marker: item.marker,
				color: item.color
			}))
			const uniquePhotos = newPhotos.filter(
				p =>
					!this.photoCollection.markers.some(
						prev => prev._type === 'photo' && prev.cid === p.cid
					)
			)
			this.photoCollection = {
				markers: dedupeMarkers([
					...this.photoCollection.markers,
					...uniquePhotos
				])
			}
		} catch (error) {
			Alert.alert(t('common.error'), t('map.markersError'))
		}
	}

	@action.bound
	async findPlace() {
		try {
			this.places = await ApiService.searchPlace(this.queryPlace)
		} catch (error: any) {
			if (error.message === '429') {
				Alert.alert(t('common.error'), t('map.searchLimit'))
			}
		}
	}
}

export default MapVM
