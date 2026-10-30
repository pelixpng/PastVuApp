import { BackHandler, StyleSheet, View } from 'react-native'
import MapVM from './Map.vm'
import { YearsSlider } from '../../../../core/components/map/YearsSlider'
import { observer } from 'mobx-react-lite'
import {
	SEARCH_FIELD_HEIGHT,
	SearchPlace
} from '../../../../core/components/map/SearchPlace'
import { useVM } from '../../../../core/hooks/useVM'
import { GoogleAppleMaps } from '../../../../core/components/map/GoogleAppleMaps'
import { YandexMaps } from '../../../../core/components/map/YandexMaps'
import MapStore from '../../../../core/store/Map.store'
import { useCallback } from 'react'
import { useFocusEffect, useNavigationState } from '@react-navigation/native'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import {
	useSafeAreaFrame,
	useSafeAreaInsets
} from 'react-native-safe-area-context'
import { Portal } from '../../../../core/components/ui/portal/Portal'
import { SCREENS } from '../../../navigation/navigation.types'
import { MapButtons } from './components/MapButtons'
import {
	miniSheetHeight,
	NearbyPhotosSheet,
	SheetSnap,
	useNearbySheet
} from './components/NearbyPhotosSheet'

/** Room left between the expanded sheet and the search field above it. */
const SEARCH_GAP = 12
/** Share of the screen the sheet opens to, counted from its very bottom. */
const COLLAPSED_SHARE = 0.45

export const MapScreen = observer(() => {
	const vm = useVM(MapVM)
	const tabBarHeight = useBottomTabBarHeight()
	// The whole screen, the strip the app draws under the Android navigation bar included, which
	// the window's size can leave out.
	const { height: screenHeight, width: screenWidth } = useSafeAreaFrame()
	const { top, bottom } = useSafeAreaInsets()
	// The sheet opens to COLLAPSED_SHARE of the screen and pulls up to just under the search field.
	const collapsedHeight = Math.round(screenHeight * COLLAPSED_SHARE)
	// Dragged down, it drops to a row of large photos instead of closing.
	const miniHeight = Math.min(miniSheetHeight(screenWidth, bottom), collapsedHeight)
	const expandedHeight = Math.max(
		collapsedHeight,
		screenHeight - top - SEARCH_FIELD_HEIGHT - SEARCH_GAP
	)
	// The sheet draws in the tabs' card, under any photo pushed over the tabs, so it only has to go
	// when another tab is chosen.
	const isTabSelected = useNavigationState(
		state => state.routes[state.index]?.name === SCREENS.MAP
	)
	const nearbyOpen = vm.nearbyOpen
	// Opens collapsed (drawn through a portal, it slides in a frame or two later, once laid out),
	// slides away on closing, and tells when the map's logo goes above it.
	const sheet = useNearbySheet(
		nearbyOpen,
		miniHeight,
		collapsedHeight,
		expandedHeight
	)

	// Android's back button closes the sheet first; only while the map is in front, so it still
	// leaves a photo opened from the sheet.
	useFocusEffect(
		useCallback(() => {
			if (!nearbyOpen) return
			const subscription = BackHandler.addEventListener(
				'hardwareBackPress',
				() => {
					vm.closeNearby()
					return true
				}
			)
			return () => subscription.remove()
		}, [nearbyOpen, vm])
	)

	// Searching for a place leaves the nearby photos: the sheet would hide the results and the
	// keyboard, and the map is about to move somewhere else anyway.
	const closeSheetForSearch = useCallback(() => {
		if (vm.nearbyOpen) vm.closeNearby()
	}, [vm])

	// Apple's and Yandex's terms want their logos in sight: above the sheet where it rests, collapsed
	// (also when pulled higher) or dropped to its row of photos.
	const mapBottomInset =
		sheet.logoStop === SheetSnap.Mini
			? miniHeight - tabBarHeight
			: sheet.logoStop === SheetSnap.Collapsed ||
				  sheet.logoStop === SheetSnap.Expanded
				? collapsedHeight - tabBarHeight
				: undefined

	return (
		<View style={s.flexOne}>
			<SearchPlace
				search={vm.map.placeSearch}
				goToLocation={vm.map.goToLocation}
				onFocus={closeSheetForSearch}
			/>
			{MapStore.mapProvider === 'yandex' ? (
				<YandexMaps
					mapRef={vm.map.yamapRef}
					markers={vm.map.photoCollection.markers}
					initialRegion={vm.map.coordinates}
					onRegionChangeComplete={vm.map.setCoordinate}
					onShowPhoto={vm.showPhoto}
					onGoToLocation={vm.map.zoomToCluster}
					bottomInset={mapBottomInset}
				/>
			) : (
				<GoogleAppleMaps
					mapRef={vm.map.mapRef}
					markers={vm.map.photoCollection.markers}
					mapType={vm.mapTypeSetting}
					mapMarkerType={vm.mapMarkerType}
					initialRegion={vm.map.coordinates}
					onRegionChangeComplete={vm.map.setCoordinate}
					onShowPhoto={vm.showPhoto}
					onGoToLocation={vm.map.zoomToCluster}
					bottomInset={mapBottomInset}
				/>
			)}
			<MapButtons
				sheetHeight={sheet.height}
				collapsedHeight={collapsedHeight}
				tabBarHeight={tabBarHeight}
				nearbyOpen={nearbyOpen}
				onToggleNearby={vm.toggleNearby}
				onLocate={vm.map.getCurrentLocation}
			/>
			<YearsSlider
				value={vm.map.yearsRange}
				setValue={vm.map.setYearsRange}
			/>
			{isTabSelected && (nearbyOpen || sheet.onScreen) && (
				<Portal>
					<NearbyPhotosSheet
						nearby={vm.nearby}
						onOpenPhoto={vm.showPhoto}
						height={sheet.height}
						snap={sheet.snap}
						miniHeight={miniHeight}
						collapsedHeight={collapsedHeight}
						expandedHeight={expandedHeight}
					/>
				</Portal>
			)}
		</View>
	)
})

const s = StyleSheet.create({
	flexOne: { flex: 1 }
})
