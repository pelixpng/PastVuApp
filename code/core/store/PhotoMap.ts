import * as Location from 'expo-location'
import { action, autorun, makeObservable, observable, reaction } from 'mobx'
import { Alert, Keyboard, Platform } from 'react-native'
import MapView, { Region } from 'react-native-maps'
import { createRef } from 'react'
import type { YaMapRef } from '@exterio/react-native-yamap-lite'
import {
	getClustersPhotosProps,
	getPhotoListProps,
	MapMarker,
	PhotoMarker
} from '../types/apiPhotoList'
import { MMKVStorage } from '../storage/mmkv'
import { YearsRangeType } from '../types/components'
import MapStore from './Map.store'
import ApiStore from './Api.store'
import { getPolygons, getZoom, zoomLevelToAltitude } from '../utils/getMapData'
import ApiService from '../api/apiService'
import { dedupeMarkers } from '../services/mapMarkers'
import { t } from '../i18n'
import { defaultRegion } from '../constants/map'
import { PlaceSearch } from './PlaceSearch'

/** Matches `cameraZoomRange.minCenterCoordinateDistance` on the MapView. */
const MIN_ALTITUDE = 100

/**
 * The photo map, shared by the phone and the tablet: the area in view and the years on the slider,
 * both kept between launches, the markers for them, the place search over the map and the camera's
 * moves. The screen's view model keeps what a tapped photo opens.
 */
export class PhotoMap {
	readonly mapRef = createRef<MapView>()
	/** The Yandex map, when that provider is selected; only one of the two refs is mounted. */
	readonly yamapRef = createRef<YaMapRef>()
	@observable.ref photoCollection: { markers: MapMarker[] } = { markers: [] }
	@observable.ref coordinates: Region =
		MMKVStorage.get('RegionString') ?? defaultRegion()
	@observable.ref yearsRange: YearsRangeType = MMKVStorage.get(
		'RangeYears'
	) ?? [1840, 2000]
	/** The place search in the field over the map. */
	readonly placeSearch = new PlaceSearch()
	private collectionTimeoutId: ReturnType<typeof setTimeout> | null = null
	/** Counts the marker requests: only the latest one's answer may reach the map. */
	private markersRequest = 0

	constructor() {
		makeObservable(this)
		// Everything below comes after makeObservable, so it tracks the map's centre and years.
		autorun(() => {
			if (!this.coordinates) return
			if (this.collectionTimeoutId) clearTimeout(this.collectionTimeoutId)
			// The first request, for the region kept from the last launch, goes out at once: only
			// the map's moves need to settle first.
			if (this.markersRequest === 0) {
				this.getPhotoCollection()
				return
			}
			this.collectionTimeoutId = setTimeout(
				() => this.getPhotoCollection(),
				300
			)
		})
		reaction(
			() => this.yearsRange,
			() => {
				this.photoCollection = { markers: [] }
				this.getPhotoCollection()
			}
		)
	}

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
	goToLocation(latitude: number, longitude: number) {
		Keyboard.dismiss()
		this.placeSearch.clearResults()
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
			this.yamapRef.current?.setCenter(
				{ lat: latitude, lon: longitude },
				16,
				0,
				0,
				2000,
				'SMOOTH'
			)
			return
		}
		if (this.mapRef.current) {
			this.mapRef.current.animateCamera(camera, { duration: 2000 })
		}
	}

	@action.bound
	async zoomToCluster(latitude: number, longitude: number) {
		if (MapStore.mapProvider === 'yandex') {
			const yamap = this.yamapRef.current
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
		const map = this.mapRef.current
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
		// While the map moves, an older request may answer after a newer one: its area is gone.
		const request = ++this.markersRequest
		try {
			const zoom = getZoom(this.coordinates.latitudeDelta)
			if (ApiStore.showCluster === 'yes') {
				const paramsClustersApi: getClustersPhotosProps = {
					polygons: getPolygons(this.coordinates),
					yearStart: this.yearsRange[0],
					yearEnd: this.yearsRange[1],
					zoom
				}
				const markers = await ApiService.getPhotosClusters(paramsClustersApi)
				if (request !== this.markersRequest) return
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
			if (request !== this.markersRequest) return
			const newPhotos: PhotoMarker[] = photoArray.map(photo => ({
				...photo,
				_type: 'photo'
			}))
			// The markers already on the map come first, so a photo they hold keeps its object and its
			// marker is not drawn again.
			this.photoCollection = {
				markers: dedupeMarkers([...this.photoCollection.markers, ...newPhotos])
			}
		} catch (error) {
			// Panning offline fails every request on the way: only the last one tells.
			if (request === this.markersRequest) {
				Alert.alert(t('common.error'), t('map.markersError'))
			}
		}
	}
}
