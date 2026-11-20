import { BackHandler, Platform, StyleSheet, View } from 'react-native'
import MapVM from './Map.vm'
import {
	YEARS_SLIDER_HEIGHT,
	YearsSlider
} from '../../../core/components/map/YearsSlider'
import { observer } from 'mobx-react-lite'
import {
	SEARCH_FIELD_HEIGHT,
	SearchPlace
} from '../../../core/components/map/SearchPlace'
import { topOnUnfoldedCameraLine } from '../../../core/utils/sideCamera'
import { useVM } from '../../../core/hooks/useVM'
import { PhotoDetail } from './components/photoDetail/PhotoDetail'
import { GoogleAppleMaps } from '../../../core/components/map/GoogleAppleMaps'
import { YandexMaps } from '../../../core/components/map/YandexMaps'
import MapStore from '../../../core/store/Map.store'
import { FC, ReactNode, useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { useFocusEffect, useTheme } from '@react-navigation/native'
import Animated, {
	cancelAnimation,
	FadeOut,
	useAnimatedStyle,
	useSharedValue,
	withTiming
} from 'react-native-reanimated'
import { scheduleOnRN } from 'react-native-worklets'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { MapButtons } from './components/mapButtons/MapButtons'
import {
	StreetViewNotice,
	YandexTranslationNotice
} from './components/mapHiddenNotice/MapHiddenNotice'
import { refreshWindowRegion } from '../../../modules/window-region'
import TranslationStore, {
	commentTranslationId,
	photoTranslationId
} from '../../../core/store/Translation.store'
import {
	cardWidthWithin,
	miniSheetHeight,
	NearbyPhotosSheet,
	SheetColumn,
	useNearbySheet,
	useSheetRestHeight
} from '../../../mobile/screens/home/map/components/NearbyPhotosSheet'
import { useTabletLayout } from '../../hooks/useTabletLayout'
import { SCREENS } from '../../navigation/navigation.types'
import { usePanelHandoff } from '../../hooks/usePanelHandoff'

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
/**
 * In a short window (see TabletLayout.short) the cards are made narrower, so the row of cards stays
 * this far below the list's opening height: about what the shortest full-screen tablets leave
 * (a 1280x800 Android tablet about 50 pt, an iPad mini in landscape 58), room for the list and the
 * cards to fade out on their own sides of half-way (see the sheet's SWAP_BAND).
 */
const SHORT_STOP_GAP = 48
/** Narrower than a list row's thumbnail, a card would show less than the list does. */
const MIN_CARD_WIDTH = 80

export const MapScreen = observer(() => {
	const vm = useVM(MapVM)
	usePanelHandoff(SCREENS.MAP, vm.panel, vm.showPhoto, () => vm.showPhotoDetail)
	const { colors } = useTheme()
	// Google's badge is on screen once the post or any of its comments shows a translation.
	const { postInfo, comments } = vm.panel
	const translationShown =
		!!postInfo &&
		(TranslationStore.state(photoTranslationId(postInfo.cid)) === 'translated' ||
			comments.some(
				comment =>
					TranslationStore.state(commentTranslationId(comment.cid)) === 'translated'
			))
	// What hides the map behind the open post, if anything. Google's Maps terms forbid Street View
	// on a screen with a non-Google map, and then-and-now opens on it: an Apple map (every map on
	// iOS that is not Yandex) or a Yandex one goes while it is open.
	const nonGoogleMap = Platform.OS === 'ios' || MapStore.mapProvider === 'yandex'
	const mapCover = !vm.showPhotoDetail
		? null
		: vm.panel.compareMode && nonGoogleMap
			? 'streetView'
			: MapStore.mapProvider === 'yandex' && translationShown
				? 'translation'
				: null
	// What the cover has fully hidden the map for. Then-and-now waits for it over an Apple or Yandex
	// map, so the map fades out rather than vanishing and Street View never shows beside it.
	const [coveredFor, setCoveredFor] = useState<MapCoverReason | null>(null)
	const compareReady = mapCover !== 'streetView' || coveredFor === 'streetView'
	const nearbyOpen = vm.nearby.open
	// From the root view's size, not Dimensions, which on iOS can keep the size from before a turn
	// (see core/hooks/useRootSize).
	const layout = useTabletLayout()
	// The search field, the years slider, the sheet and the notice share the column with the tab bar.
	const { columnLeft, columnWidth, height: screenHeight } = layout
	const { top } = useSafeAreaInsets()
	// Level with the camera on an iPhone unfolded in portrait, otherwise at the top inset.
	const fieldTop = topOnUnfoldedCameraLine(top, SEARCH_FIELD_HEIGHT) ?? top
	const tabBarHeight = useBottomTabBarHeight()
	// Where the search field and the years slider stand, the same column as the sheet's.
	const fieldColumn = useMemo(
		() => ({ left: columnLeft, width: columnWidth }),
		[columnLeft, columnWidth]
	)
	// The top of the slider's card, from the bottom of the screen, and the room from there up to the
	// search field's bottom.
	const cardTop = tabBarHeight + YEARS_SLIDER_HEIGHT
	const room = screenHeight - fieldTop - SEARCH_FIELD_HEIGHT - cardTop
	// The stops count from the sheet's bottom edge, which is tucked behind the card.
	const collapsedHeight = Math.round(room * COLLAPSED_SHARE) + TUCK
	// Dragged down, it drops to a row of large photos, sized from the column, instead of closing. In
	// a short window cards that wide would reach the opening height or past it, leaving no stop
	// between the two, so they are made narrower.
	const maxCardWidth = layout.short
		? Math.max(MIN_CARD_WIDTH, cardWidthWithin(collapsedHeight - SHORT_STOP_GAP, TUCK))
		: undefined
	const miniHeight = Math.min(
		miniSheetHeight(columnWidth, TUCK, maxCardWidth),
		collapsedHeight
	)
	const expandedHeight = Math.max(collapsedHeight, room - SEARCH_GAP - LOGO_ROOM + TUCK)
	const column = useMemo<SheetColumn>(
		() => ({
			left: columnLeft,
			width: columnWidth,
			bottom: cardTop - TUCK,
			tucked: TUCK,
			maxCardWidth
		}),
		[columnLeft, columnWidth, cardTop, maxCardWidth]
	)
	// Opens collapsed (mounted in this commit, it slides in once laid out) and slides away on
	// closing; the height it comes to rest at lifts the map's logo (see mapBottomInset).
	const sheet = useNearbySheet(
		nearbyOpen,
		miniHeight,
		collapsedHeight,
		expandedHeight
	)
	const restHeight = useSheetRestHeight(
		sheet.height,
		sheet.snap,
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
	// sheet comes up: once it has come to rest they stand above it, at whichever stop. The height it
	// rested at, not the stop's current one: when a turn changes the stops, the logo, and the map's
	// layout with it, moves once the sheet has slid there rather than at the start of the slide. No
	// higher than the expanded stop, though, which a height from before a turn to a shorter window
	// can be: above it the logo would be off the screen. Counted from the bottom of the screen.
	const mapBottomInset =
		restHeight > 0
			? column.bottom + Math.min(restHeight, expandedHeight)
			: undefined

	return (
		<View style={s.flexOne}>
			<SearchPlace
				search={vm.map.placeSearch}
				goToLocation={vm.map.goToLocation}
				onFocus={closeNearbyForSearch}
				column={fieldColumn}
				besideCamera={{ top: fieldTop }}
			/>
			{MapStore.mapProvider === 'yandex' ? (
				<YandexMaps
					mapRef={vm.map.yamapRef}
					initialCamera={vm.map.yandexCamera}
					onCameraChange={vm.map.setYandexCamera}
					markers={vm.map.photoCollection.markers}
					initialRegion={vm.map.coordinates}
					onRegionChangeComplete={vm.map.setCoordinate}
					onShowPhoto={vm.showPhoto}
					onGoToLocation={vm.map.zoomToCluster}
					isTablet
					bottomInset={mapBottomInset}
				/>
			) : (
				<GoogleAppleMaps
					mapRef={vm.map.mapRef}
					initialCamera={vm.map.mapsCamera}
					onCameraChange={vm.map.setMapsCamera}
					markers={vm.map.photoCollection.markers}
					mapType={vm.mapTypeSetting}
					mapMarkerType={vm.mapMarkerType}
					initialRegion={vm.map.coordinates}
					onRegionChangeComplete={vm.map.setCoordinate}
					onShowPhoto={vm.showPhoto}
					onGoToLocation={vm.map.zoomToCluster}
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
			{/* While a translation shows beside a Yandex map, the map is covered and the post stays in
			    its panel: Google's terms forbid its logo, which marks every translation, on a screen
			    that shows a competing search service's, and Yandex's terms forbid hiding or covering
			    its logo on a map in sight. Untranslated, the post stays beside the map. Then-and-now
			    does the same beside any map but Google's (see mapCover). */}
			{mapCover && (
				<MapCover reason={mapCover} color={colors.backgroundApp} onCovered={setCoveredFor}>
					{/* In the left column, between the top and the tab bar: why the map is gone. As wide
					    as the lists on the other tabs, so the cards inside, 16 in, line up with the
					    column. */}
					<View
						style={[
							s.notice,
							{
								top,
								bottom: tabBarHeight,
								left: columnLeft - 16,
								width: layout.listWidth
							}
						]}
					>
						{mapCover === 'streetView' ? <StreetViewNotice /> : <YandexTranslationNotice />}
					</View>
				</MapCover>
			)}
			{vm.showPhotoDetail && (
				<PhotoDetail
					panel={vm.panel}
					closePhoto={vm.closePhoto}
					onLinkPress={vm.openPhotoFromLink}
					onOpenPhoto={vm.showPhoto}
					compareReady={compareReady}
				/>
			)}
			<MapButtons
				nearbyOpen={nearbyOpen}
				onToggleNearby={vm.nearby.toggle}
				onLocate={vm.map.getCurrentLocation}
			/>
			<YearsSlider
				value={vm.map.yearsRange}
				setValue={vm.map.setYearsRange}
				column={fieldColumn}
			/>
		</View>
	)
})

/** In step with the post panel sliding in and out. */
const COVER_FADE = { duration: 600 }
/** Short: then-and-now waits for it, after the tap. */
const STREET_VIEW_FADE = { duration: 250 }
const COVER_OUT = FadeOut.duration(600)

type MapCoverReason = 'streetView' | 'translation'

type MapCoverProps = {
	reason: MapCoverReason
	color: string
	/** The cover has turned opaque for this reason; null once it is gone. */
	onCovered: (reason: MapCoverReason | null) => void
	children: ReactNode
}

/**
 * The opaque cover over the map. For a translation it fades in with the post panel sliding in; for
 * Street View quickly, after the tap, and then-and-now opens only once it is opaque (see
 * `onCovered`): Google's terms forbid Street View on a screen that shows an Apple or Yandex map.
 * A cover already opaque for a translation counts at once. It fades out either way.
 */
const MapCover: FC<MapCoverProps> = ({ reason, color, onCovered, children }) => {
	const opacity = useSharedValue(0)
	useLayoutEffect(() => {
		if (opacity.value >= 1) {
			onCovered(reason)
			return
		}
		cancelAnimation(opacity)
		opacity.value = withTiming(
			1,
			reason === 'streetView' ? STREET_VIEW_FADE : COVER_FADE,
			finished => {
				if (finished) scheduleOnRN(onCovered, reason)
			}
		)
	}, [reason, opacity, onCovered])
	useEffect(() => () => onCovered(null), [onCovered])
	const fade = useAnimatedStyle(() => ({ opacity: opacity.value }))
	return (
		<Animated.View
			style={[s.cover, { backgroundColor: color }, fade]}
			exiting={COVER_OUT}
			// A new view over the map: on Android the window's transparent region is gathered again
			// with it (see modules/window-region).
			onLayout={refreshWindowRegion}
		>
			{children}
		</Animated.View>
	)
}

const s = StyleSheet.create({
	flexOne: { flex: 1 },
	// Under the post panel (zIndex 50), over the map, the search field, its buttons and the slider.
	cover: {
		position: 'absolute',
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
		zIndex: 49
	},
	notice: { position: 'absolute' }
})
