import { YaMap, Marker, YaMapRef } from 'react-native-yamap-lite'
import {
	LayoutChangeEvent,
	PixelRatio,
	StyleSheet,
	useWindowDimensions,
	View
} from 'react-native'
import { RefObject, useEffect, useRef, useState } from 'react'
import { useTheme } from '@react-navigation/native'
import { Region } from 'react-native-maps'
import { MapMarker } from '../../types/apiPhotoList'
import { markerKey } from '../../services/mapMarkers'
import { getZoom } from '../../utils/getMapData'
import { isTablet } from 'react-native-device-info'
import { initYandexMaps } from '../../services/yandexMaps'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'

const TILE_SIZE = 256
/** Just clear of the years slider on phones, in points. */
const PHONE_LOGO_BOTTOM = 86
const MIN_ZOOM = isTablet() ? 5 : 4

type CameraPosition = {
	nativeEvent: {
		point: { lat: number; lon: number }
		zoom: number
	}
}

type Props = {
	mapRef: RefObject<YaMapRef | null>
	markers: MapMarker[]
	initialRegion: Region
	onRegionChangeComplete: (region: Region) => void
	onShowPhoto: (cid: string, title: string) => void
	onGoToLocation: (lat: number, lng: number) => void
	isTablet?: boolean
}

/**
 * Yandex MapKit as an alternative to Google/Apple maps, chosen in settings.
 *
 * The map is given an explicit height once it has laid out: Yoga honours it and ignores the
 * shrink the keyboard would otherwise cause when the search field opens, so the map does not
 * re-fit and jump under the user. Same problem does not exist with react-native-maps.
 */
export const YandexMaps = ({
	mapRef,
	markers,
	initialRegion,
	onRegionChangeComplete,
	onShowPhoto,
	onGoToLocation,
	isTablet
}: Props) => {
	const { names } = useTheme()
	const { width: screenWidth } = useWindowDimensions()
	const tabBarHeight = useBottomTabBarHeight()
	// Yandex's terms require the logo to stay visible. The years slider covers the bottom of the map,
	// so the logo is lifted above it: just above the slider, which on tablets sits on top of
	// the tab bar in the bottom-left corner, where the map runs underneath the bar. MapKit measures the
	// logo padding in physical pixels on both platforms, not in points.
	const toNative = (points: number) =>
		Math.round(PixelRatio.getPixelSizeForLayoutSize(points))
	const logoPadding = {
		vertical: toNative(
			isTablet ? tabBarHeight + PHONE_LOGO_BOTTOM : PHONE_LOGO_BOTTOM
		),
		// MapKit adds its own margin on top of the padding; 8 lands the logo 16 pt from the edge.
		horizontal: toNative(8)
	}
	const logoPosition = {
		vertical: 'bottom' as const,
		horizontal: 'left' as const
	}
	const [lockedHeight, setLockedHeight] = useState<number>()
	// MapKit refuses to create a map before it has its key, so the view waits for init.
	const [ready, setReady] = useState(false)
	useEffect(() => {
		let cancelled = false
		initYandexMaps()
			.then(() => !cancelled && setReady(true))
			.catch(() => undefined)
		return () => {
			cancelled = true
		}
	}, [])
	const onLayout = (e: LayoutChangeEvent) => {
		const { height } = e.nativeEvent.layout
		setLockedHeight(current =>
			current === undefined || height > current ? height : current
		)
	}

	const yamapInitialRegion = useRef({
		lat: initialRegion.latitude,
		lon: initialRegion.longitude,
		zoom: getZoom(initialRegion.latitudeDelta)
	}).current

	const handleCameraChange = (e: CameraPosition) => {
		const { point, zoom } = e.nativeEvent
		// Yandex reports a zoom level; the rest of the app thinks in react-native-maps deltas.
		const degreePerTile = 360 / Math.pow(2, zoom)
		const longitudeDelta = degreePerTile * (screenWidth / TILE_SIZE)
		onRegionChangeComplete({
			latitude: point.lat,
			longitude: point.lon,
			latitudeDelta: longitudeDelta,
			longitudeDelta
		})
	}

	const dark = names.themeName === 'dark'

	return (
		<View
			style={[
				s.flexOne,
				lockedHeight !== undefined && { height: lockedHeight }
			]}
			onLayout={onLayout}
		>
			{ready && (
				<YaMap
					ref={mapRef}
					style={s.flexOne}
					nightMode={dark}
					showUserPosition={false}
					// Markers point in the photo's direction, so the map must keep north up, as it does on
					// Google/Apple maps.
					rotateGesturesEnabled={false}
					minZoomPreference={MIN_ZOOM}
					initialRegion={yamapInitialRegion}
					logoPosition={logoPosition}
					logoPadding={logoPadding}
					onCameraPositionChangeEnd={handleCameraChange}
				>
					{markers.map(marker =>
						marker._type === 'photo' ? (
							<Marker
								key={markerKey(marker)}
								rotated
								rotation={marker.dir}
								point={{
									lat: marker.location.latitude,
									lon: marker.location.longitude
								}}
								source={{ uri: dark ? marker.marker[1] : marker.marker[0] }}
								onPress={() => onShowPhoto(marker.cid, marker.title)}
							/>
						) : (
							<Marker
								key={markerKey(marker)}
								point={{
									lat: marker.location.latitude,
									lon: marker.location.longitude
								}}
								source={{ uri: dark ? marker.marker[1] : marker.marker[0] }}
								onPress={() =>
									onGoToLocation(
										marker.location.latitude,
										marker.location.longitude
									)
								}
							/>
						)
					)}
				</YaMap>
			)}
		</View>
	)
}

const s = StyleSheet.create({
	flexOne: { flex: 1 }
})
