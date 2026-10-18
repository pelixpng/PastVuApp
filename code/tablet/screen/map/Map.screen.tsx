import { BackHandler, StyleSheet, View } from 'react-native'
import MapVM, { mapRef, yamapRef } from './Map.vm'
import {
	YEARS_SLIDER_HEIGHT,
	YearsSlider
} from '../../../core/components/map/YearsSlider'
import { observer } from 'mobx-react-lite'
import {
	SEARCH_FIELD_HEIGHT,
	SearchPlace
} from '../../../core/components/map/SearchPlace'
import { useVM } from '../../../core/hooks/useVM'
import { PhotoDetail } from './components/photoDetail/PhotoDetail'
import { GoogleAppleMaps } from '../../../core/components/map/GoogleAppleMaps'
import { YandexMaps } from '../../../core/components/map/YandexMaps'
import MapStore from '../../../core/store/Map.store'
import { useCallback, useMemo } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import {
	useSafeAreaFrame,
	useSafeAreaInsets
} from 'react-native-safe-area-context'
import { MapButtons } from './components/mapButtons/MapButtons'
import {
	miniSheetHeight,
	NearbyPhotosSheet,
	SheetColumn,
	SheetSnap,
	useNearbySheet
} from '../../../mobile/screens/home/map/components/NearbyPhotosSheet'

/** The left column, as the search field, the years slider and the tab bar take it. */
const COLUMN_LEFT = 16
const COLUMN_SHARE = 0.33
/** Room left between the expanded sheet and the search field above it, as on the phone. */
const SEARCH_GAP = 12
/**
 * Above the expanded sheet, under the search field, for the map's logo: the map stays in sight
 * right of the sheet, so Apple's and Yandex's terms want their logo shown, and the expanded sheet
 * covers its usual place. The Apple Maps line with its legal link is about 22 pt, and MapKit keeps
 * it about 10 pt inside the margin.
 */
const LOGO_ROOM = 32
/**
 * Share of the room between the slider's card and the search field that the sheet opens to: a
 * little over half, as the map's main part lies right of the column anyway. At half, the low stop,
 * whose photos are sized from the column's width, would sit only 22-32 pt below it on an iPad mini
 * or a 1280x800 Android tablet.
 */
const COLLAPSED_SHARE = 0.55
/**
 * How far the sheet reaches down behind the card of the years slider and the tab bar, which stays
 * in front of it: past the card's rounded top corners (16), so no map shows in them and the two
 * read as one column.
 */
const TUCK = 16

export const MapScreen = observer(() => {
	const vm = useVM(MapVM)
	const nearbyOpen = vm.nearby.open
	// The root view's size, as the column's '33%' takes it: Dimensions keeps the portrait size after
	// the app turns itself to landscape (see core/hooks/useRootSize).
	const { height: screenHeight, width: screenWidth } = useSafeAreaFrame()
	const { top } = useSafeAreaInsets()
	const tabBarHeight = useBottomTabBarHeight()
	const columnWidth = screenWidth * COLUMN_SHARE
	// The top of the slider's card, from the bottom of the screen, and the room from there up to the
	// search field's bottom.
	const cardTop = tabBarHeight + YEARS_SLIDER_HEIGHT
	const room = screenHeight - top - SEARCH_FIELD_HEIGHT - cardTop
	// The stops count from the sheet's bottom edge, which is tucked behind the card.
	const collapsedHeight = Math.round(room * COLLAPSED_SHARE) + TUCK
	// Dragged down, it drops to a row of large photos, sized from the column, instead of closing.
	const miniHeight = Math.min(
		miniSheetHeight(columnWidth, TUCK),
		collapsedHeight
	)
	const expandedHeight = Math.max(collapsedHeight, room - SEARCH_GAP - LOGO_ROOM + TUCK)
	const column = useMemo<SheetColumn>(
		() => ({
			left: COLUMN_LEFT,
			width: columnWidth,
			bottom: cardTop - TUCK,
			tucked: TUCK
		}),
		[columnWidth, cardTop]
	)
	// Opens collapsed (mounted in this commit, it slides in once laid out), slides away on closing,
	// and tells when the map's logo goes above it.
	const sheet = useNearbySheet(
		nearbyOpen,
		miniHeight,
		collapsedHeight,
		expandedHeight
	)

	// Android's back button closes the nearby photos while the map is in front.
	useFocusEffect(
		useCallback(() => {
			if (!nearbyOpen) return
			const subscription = BackHandler.addEventListener(
				'hardwareBackPress',
				() => {
					vm.nearby.close()
					return true
				}
			)
			return () => subscription.remove()
		}, [nearbyOpen, vm])
	)

	// Searching for a place leaves the nearby photos: the sheet would hide the results, and the map
	// is about to move somewhere else anyway.
	const closeNearbyForSearch = useCallback(() => {
		if (vm.nearby.open) vm.nearby.close()
	}, [vm])

	// Apple's and Yandex's terms want their logos in sight. They sit just above the slider, where the
	// sheet comes up: once it has come to rest they stand above it, at whichever stop. Counted from
	// the bottom of the screen.
	const mapBottomInset =
		sheet.logoStop === SheetSnap.Mini
			? column.bottom + miniHeight
			: sheet.logoStop === SheetSnap.Collapsed
				? column.bottom + collapsedHeight
				: sheet.logoStop === SheetSnap.Expanded
					? column.bottom + expandedHeight
					: undefined

	return (
		<View style={s.flexOne}>
			<SearchPlace
				places={vm.places}
				query={vm.queryPlace}
				setQueryPlace={vm.setQueryPlace}
				goToLocation={vm.goToLocation}
				onFocus={closeNearbyForSearch}
				isTablet
			/>
			{MapStore.mapProvider === 'yandex' ? (
				<YandexMaps
					mapRef={yamapRef}
					markers={vm.photoCollection.markers}
					initialRegion={vm.coordinates}
					onRegionChangeComplete={vm.setCoordinate}
					onShowPhoto={vm.showPhoto}
					onGoToLocation={vm.zoomToCluster}
					isTablet
					bottomInset={mapBottomInset}
				/>
			) : (
				<GoogleAppleMaps
					mapRef={mapRef}
					markers={vm.photoCollection.markers}
					mapType={vm.mapTypeSetting}
					mapMarkerType={vm.mapMarkerType}
					initialRegion={vm.coordinates}
					onRegionChangeComplete={vm.setCoordinate}
					onShowPhoto={vm.showPhoto}
					onGoToLocation={vm.zoomToCluster}
					isTablet
					bottomInset={mapBottomInset}
				/>
			)}
			{/* Before the slider, whose card (zIndex 8) and the tab bar stay in front of it. */}
			{(nearbyOpen || sheet.onScreen) && (
				<NearbyPhotosSheet
					nearby={vm.nearby}
					onOpenPhoto={vm.showPhoto}
					height={sheet.height}
					snap={sheet.snap}
					miniHeight={miniHeight}
					collapsedHeight={collapsedHeight}
					expandedHeight={expandedHeight}
					column={column}
				/>
			)}
			{vm.showPhotoDetail && (
				<PhotoDetail
					postInfo={vm.postInfo}
					users={vm.users}
					comments={vm.comments}
					closePhoto={vm.closePhoto}
					onImageLoaded={vm.onImageLoad}
					openFullScreen={vm.openFullScreenImage}
					colorize={vm.colorize}
					saveImage={vm.saveImage}
					share={vm.share}
					imageLink={vm.imageLink}
					isImageLoaded={vm.isImageLoaded}
					onLinkPress={vm.openPhotoFromLink}
					onOpenPhoto={vm.showPhoto}
					isFavorite={vm.isFavorite}
					toggleFavorite={vm.toggleFavorite}
					hasStreetView={vm.hasStreetView}
					openCompare={vm.openCompare}
					compareMode={vm.compareMode}
					closeCompare={vm.closeCompare}
					streetView={vm.streetView}
					comparePhoto={vm.comparePhoto}
				/>
			)}
			<MapButtons
				nearbyOpen={nearbyOpen}
				onToggleNearby={vm.nearby.toggle}
				onLocate={vm.getCurrentLocation}
			/>
			<YearsSlider value={vm.yearsRange} setValue={vm.setYearsRange} isTablet />
		</View>
	)
})

const s = StyleSheet.create({
	flexOne: { flex: 1 }
})
