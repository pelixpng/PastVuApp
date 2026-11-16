import { YaMap, Marker, YaMapRef } from '@exterio/react-native-yamap-lite'
import { LayoutChangeEvent, PixelRatio, StyleSheet, View } from 'react-native'
import { RefObject, useEffect, useRef, useState } from 'react'
import { useTheme } from '@react-navigation/native'
import { Region } from 'react-native-maps'
import { MapMarker } from '../../types/apiPhotoList'
import { markerKey } from '../../services/mapMarkers'
import { getZoom } from '../../utils/getMapData'
import { initYandexMaps } from '../../services/yandexMaps'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { useRootSize } from '../../hooks/useRootSize'

const TILE_SIZE = 256
/** Just clear of the years slider on phones, in points. */
const PHONE_LOGO_BOTTOM = 86
/** The furthest out the map zooms, by the interface shown, which a foldable can change (App.tsx). */
const minZoom = (isTablet?: boolean) => (isTablet ? 5 : 4)
const RADIANS_PER_DEGREE = Math.PI / 180

type CameraPosition = {
	nativeEvent: {
		point: { lat: number; lon: number }
		zoom: number
	}
}

type Camera = { lat: number; lon: number; zoom: number }
type Size = { width: number; height: number }
/**
 * The wrapper's height lock. `width` is the wrapper's width as last laid out. `height`, while set,
 * is the height the wrapper is held at. Without it, `held` is the height of the lock last let go:
 * a layout made while that lock still held the wrapper reports its height, not the room there is.
 */
type HeightLock = { width: number; height?: number; held?: number }

/**
 * The lock after a layout of the wrapper `width` by `height`. A new width means a turn or a resized
 * window, never the keyboard; the layout that reports it was most likely made while the old lock
 * still held the wrapper, so a height equal to the lock's is no measure of the new room: the lock is
 * let go, and the layout free of it locks again. Otherwise the lock only grows.
 */
const nextLock = (
	current: HeightLock | undefined,
	width: number,
	height: number
): HeightLock => {
	if (current === undefined) return { width, height }
	if (current.width !== width) {
		const held = current.height ?? current.held
		return height === held ? { width, held } : { width, height }
	}
	if (current.height === undefined) {
		return height === current.held ? current : { width, height }
	}
	return height > current.height ? { width, height } : current
}

/**
 * The latitude span a box centred on the camera needs to cover a view `aspect` times as tall as it
 * is wide and `longitudeDelta` degrees across. On the Mercator map a degree of latitude takes more
 * room the further it is from the equator, so the half of the view towards the equator spans more
 * degrees than the half towards the pole; getPolygons centres the box on the camera, so it takes
 * twice the longer half. (Yandex draws the ellipsoid's Mercator; the sphere's spans differ from it
 * by under 1%, less than a marker.)
 */
const fittedLatitudeDelta = (
	latitude: number,
	longitudeDelta: number,
	aspect: number
) => {
	const mercatorY = (lat: number) =>
		Math.log(Math.tan(Math.PI / 4 + (lat * RADIANS_PER_DEGREE) / 2))
	const latitudeAt = (y: number) => Math.atan(Math.sinh(y)) / RADIANS_PER_DEGREE
	const halfHeight = (aspect * longitudeDelta * RADIANS_PER_DEGREE) / 2
	const center = mercatorY(latitude)
	const north = latitudeAt(center + halfHeight) - latitude
	const south = latitude - latitudeAt(center - halfHeight)
	return 2 * Math.max(north, south)
}

/**
 * The camera as the react-native-maps region the rest of the app thinks in: Yandex reports a zoom
 * level, not deltas.
 *
 * latitudeDelta never drops below longitudeDelta. That square box already covers any view wider
 * than tall, so on a landscape map latitudeDelta equals longitudeDelta at every latitude. A view
 * taller than its width, as on a tablet in portrait, needs the fitted span, or no markers would be
 * fetched for bands along its top and bottom edges nearer the equator than about 46° (11-inch
 * iPad). The phone keeps the square box (`fitHeight` off): its map is about twice as tall as wide,
 * and getZoom reads latitudeDelta for the zoom level the server clusters at, so a fitted span would
 * move that level for most of the world.
 */
const regionFromCamera = (
	camera: Camera,
	size: Size,
	fitHeight: boolean
): Region => {
	const degreePerTile = 360 / Math.pow(2, camera.zoom)
	const longitudeDelta = degreePerTile * (size.width / TILE_SIZE)
	const latitudeDelta =
		fitHeight && size.width > 0 && size.height > 0
			? Math.max(
					longitudeDelta,
					fittedLatitudeDelta(
						camera.lat,
						longitudeDelta,
						size.height / size.width
					)
				)
			: longitudeDelta
	return {
		latitude: camera.lat,
		longitude: camera.lon,
		latitudeDelta,
		longitudeDelta
	}
}

type Props = {
	mapRef: RefObject<YaMapRef | null>
	markers: MapMarker[]
	initialRegion: Region
	/**
	 * Where a map built again in this session starts instead of `initialRegion`, as an exact zoom:
	 * after iPhone Duo folds or unfolds, getZoom would round the region's span to another level.
	 */
	initialCamera?: Camera
	onRegionChangeComplete: (region: Region) => void
	/** The camera after each move, for the next map to start from. */
	onCameraChange?: (camera: Camera) => void
	onShowPhoto: (cid: string, title: string) => void
	onGoToLocation: (lat: number, lng: number) => void
	isTablet?: boolean
	/**
	 * How far up from the map's bottom edge something covers it, in points, when that is more than
	 * the years slider (and the tab bar under it on tablets): the nearby-photos sheet. The logo goes
	 * just above it.
	 */
	bottomInset?: number
}

/**
 * Yandex MapKit as an alternative to Google/Apple maps, chosen in settings.
 *
 * Once laid out, the wrapper is given the tallest height it has had as an explicit height, so a
 * keyboard that shrank the screen for the search field would not make the map re-fit and jump under
 * the user. Beside flex: 1 Yoga sizes the wrapper from its flex basis, so the height holds only
 * where a parent leaves the height open; the keyboard itself does not resize the root here
 * (adjustPan on Android; on iOS the keyboard leaves the root frame alone). A turn or a resized
 * window lets the lock go, or a map held at the old height would hang off the screen with the Yandex
 * logo. The lock is keyed on the wrapper's own measured width (see nextLock), not on the root size,
 * which reaches this component before or after the wrapper's layout depending on the turn. The same
 * problem does not exist with react-native-maps.
 */
export const YandexMaps = ({
	mapRef,
	markers,
	initialRegion,
	initialCamera,
	onRegionChangeComplete,
	onCameraChange,
	onShowPhoto,
	onGoToLocation,
	isTablet,
	bottomInset
}: Props) => {
	const { names } = useTheme()
	// Not useWindowDimensions: on iOS it can keep the size from before a turn (see
	// core/hooks/useRootSize). Neither source this reads changes with the keyboard, so a change
	// means the space for the map changed.
	const root = useRootSize()
	const tabBarHeight = useBottomTabBarHeight()
	// Yandex's terms require the logo to stay visible. The years slider covers the bottom of the map,
	// so the logo is lifted above it: just above the slider, which on tablets sits on top of
	// the tab bar in the bottom-left corner, where the map runs underneath the bar. MapKit measures the
	// logo padding in physical pixels on both platforms, not in points.
	const toNative = (points: number) =>
		Math.round(PixelRatio.getPixelSizeForLayoutSize(points))
	const logoPadding = {
		vertical: toNative(
			bottomInset ??
				(isTablet ? tabBarHeight + PHONE_LOGO_BOTTOM : PHONE_LOGO_BOTTOM)
		),
		// MapKit adds its own margin on top of the padding; 8 lands the logo 16 pt from the edge.
		horizontal: toNative(8)
	}
	const logoPosition = {
		vertical: 'bottom' as const,
		horizontal: 'left' as const
	}
	const [lock, setLock] = useState<HeightLock>()
	// The root size as last rendered. A new width reaches the wrapper's own layout too, and nextLock
	// lets the lock go there. A window that only got taller or shorter leaves the held wrapper as it
	// was, with no new layout to tell, so the lock is let go here, in the render that brings the
	// size; the next layout locks again.
	const [lockRoot, setLockRoot] = useState(root)
	if (lockRoot.width !== root.width || lockRoot.height !== root.height) {
		setLockRoot(root)
		if (lockRoot.width === root.width && lock?.height !== undefined) {
			setLock({ width: lock.width, held: lock.height })
		}
	}
	const lockedHeight = lock?.height
	// The map's own size, as last laid out, and its camera, as last reported: the region is
	// recomputed from both whenever either changes.
	const mapSize = useRef<Size | undefined>(undefined)
	const camera = useRef<Camera | undefined>(undefined)
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

	const sendRegion = () => {
		if (!camera.current) return
		onRegionChangeComplete(
			regionFromCamera(camera.current, mapSize.current ?? root, !!isTablet)
		)
	}

	const onLayout = (e: LayoutChangeEvent) => {
		const { width, height } = e.nativeEvent.layout
		setLock(current => nextLock(current, width, height))
		const previous = mapSize.current
		mapSize.current = { width, height }
		// When the view only changes size, after a turn or a resized window, MapKit keeps its camera
		// and need not report a move, so the region the markers are fetched for is sent again from
		// the last camera for the new size. The store ignores an unchanged region.
		if (
			previous &&
			(previous.width !== width || previous.height !== height)
		) {
			sendRegion()
		}
	}

	const yamapInitialRegion = useRef(
		initialCamera ?? {
			lat: initialRegion.latitude,
			lon: initialRegion.longitude,
			zoom: getZoom(initialRegion.latitudeDelta)
		}
	).current

	const handleCameraChange = (e: CameraPosition) => {
		const { point, zoom } = e.nativeEvent
		camera.current = { lat: point.lat, lon: point.lon, zoom }
		onCameraChange?.(camera.current)
		sendRegion()
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
					minZoomPreference={minZoom(isTablet)}
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
