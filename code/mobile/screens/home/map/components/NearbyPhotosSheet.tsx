import {
	FC,
	ReactNode,
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState
} from 'react'
import {
	AccessibilityActionEvent,
	ActivityIndicator,
	FlatList,
	Platform,
	StyleSheet,
	Text,
	TouchableOpacity,
	View
} from 'react-native'
import { Image } from 'expo-image'
import { useTheme } from '@react-navigation/native'
import { observer } from 'mobx-react-lite'
import {
	useSafeAreaFrame,
	useSafeAreaInsets
} from 'react-native-safe-area-context'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
	cancelAnimation,
	Easing,
	Extrapolation,
	interpolate,
	LayoutAnimationConfig,
	SharedValue,
	useAnimatedReaction,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
	FadeIn,
	FadeOut
} from 'react-native-reanimated'
import { scheduleOnRN } from 'react-native-worklets'
import { s as row } from '../../collection/components/style'
import { Spacer } from '../../../../../core/components/ui/Spacer'
import { MaterialIcons } from '../../../../../core/components/ui/icons'
import { formatDistance } from '../../../../../core/utils/formatNumber'
import {
	formatNearbyYears,
	NearbyItem,
	NearbySearch
} from '../../../../../core/store/NearbySearch'
import { t } from '../../../../../core/i18n'
import { refreshWindowRegion } from '../../../../../modules/window-region'

/**
 * Where the sheet rests: off the screen; low, with a row of large photos; at the list's opening
 * height; or up under the search field. Closed by the map's button, Android's back, focusing the
 * search field, or a swipe down from the row of photos.
 */
export const SheetSnap = { Closed: 0, Mini: 1, Collapsed: 2, Expanded: 3 } as const
export type SheetSnap = (typeof SheetSnap)[keyof typeof SheetSnap]

/** Eases out and stops where it is going, without overshooting. */
export const SHEET_TIMING = { duration: 250, easing: Easing.out(Easing.cubic) }

/**
 * A new list after the map has moved: the cards and rows stay where they are, and the photo in
 * each one dissolves into the next in place, the old fading out under the new fading in. Nothing
 * moves, grows or shrinks.
 */
const PHOTO_IN = FadeIn.duration(280).easing(Easing.inOut(Easing.quad))
const PHOTO_OUT = FadeOut.duration(280).easing(Easing.inOut(Easing.quad))

/** The grabber's strip, the only part that drags the sheet, so the list below scrolls freely. */
const HEADER_HEIGHT = 44
/** A flick faster than this, in points per second, goes on to the next stop its way. */
const FLING_VELOCITY = 900
/** Let go from the row of cards below this share of its height, the sheet closes. */
const CLOSE_SHARE = 0.6
/** How far below the row of cards a drag from higher up may pull before the sheet stops following. */
const OVERDRAG = 24
/**
 * A card in the low sheet: this share of the sheet's width (the screen's on the phone, the left
 * column's on the tablet), 4:3, the next one peeking in.
 */
const CARD_SHARE = 0.62
const CARD_GAP = 12
/** Under the cards, above the home indicator. */
const CARD_BOTTOM = 12
/**
 * Between the list and the row of cards the content follows the sheet's height: the list fades out
 * as the sheet comes down to half-way, the cards fade in from there, so the one never turns into
 * the other in sight. For this many points either side of half-way neither shows, which also hides
 * the frame or two the swap takes.
 */
const SWAP_BAND = 12

const cardSize = (sheetWidth: number) => {
	const width = Math.round(sheetWidth * CARD_SHARE)
	return { width, height: Math.round(width * 0.75) }
}

/** How tall the low sheet with its row of cards is, its empty bottom strip included. */
export const miniSheetHeight = (sheetWidth: number, bottomInset: number) =>
	HEADER_HEIGHT + cardSize(sheetWidth).height + CARD_BOTTOM + bottomInset
const ACCESSIBILITY_ACTIONS = [{ name: 'activate' }]

/**
 * The map screen's half of the sheet: its height and stop, which open collapsed and slide away as
 * `open` changes; whether it is on the screen, so the screen keeps it mounted while it slides away;
 * and whether the map's logo should stand above it. The logo rises once the sheet has arrived and
 * comes down once it has gone, so the map is not relaid out in the middle of a slide.
 */
export const useNearbySheet = (
	open: boolean,
	miniHeight: number,
	collapsedHeight: number,
	expandedHeight: number
) => {
	const height = useSharedValue(0)
	const snap = useSharedValue<SheetSnap>(SheetSnap.Closed)
	// Mounted while open and while it slides away after closing.
	const [onScreen, setOnScreen] = useState(false)
	// The stop the map's logo stands above: the one the sheet last came to rest at, none while it is
	// away. The phone keeps it above the collapsed sheet when expanded (the map is hidden then); the
	// tablet, whose map stays in sight right of the sheet, lifts it above the expanded one.
	const [logoStop, setLogoStop] = useState<SheetSnap>(SheetSnap.Closed)

	// Opening always starts collapsed. A sheet that is mounting slides in by itself once laid out,
	// so its first frame is not mid-way; one still sliding away turns back from where it is. Before
	// the paint: the tablet mounts the sheet in this same commit, with no portal in between, and its
	// layout has to find it collapsed already.
	useLayoutEffect(() => {
		if (open && snap.value === SheetSnap.Closed) {
			snap.value = SheetSnap.Collapsed
			if (height.value > 0) {
				height.value = withTiming(collapsedHeight, SHEET_TIMING)
			}
		} else if (!open && snap.value !== SheetSnap.Closed) {
			snap.value = SheetSnap.Closed
			height.value = withTiming(0, SHEET_TIMING)
		}
	}, [open, collapsedHeight, height, snap])

	// The safe area can settle after the first frame; an open sheet follows its stop.
	useEffect(() => {
		if (height.value === 0) return
		if (snap.value === SheetSnap.Mini) {
			height.value = withTiming(miniHeight, SHEET_TIMING)
		} else if (snap.value === SheetSnap.Collapsed) {
			height.value = withTiming(collapsedHeight, SHEET_TIMING)
		} else if (snap.value === SheetSnap.Expanded) {
			height.value = withTiming(expandedHeight, SHEET_TIMING)
		}
	}, [miniHeight, collapsedHeight, expandedHeight, height, snap])

	const onShown = useCallback((now: boolean) => {
		setOnScreen(now)
		if (!now) setLogoStop(SheetSnap.Closed)
	}, [])
	useAnimatedReaction(
		() => height.value > 0,
		(now, before) => {
			if (now !== before) scheduleOnRN(onShown, now)
		}
	)
	// Only once the sheet has arrived, so the map is not laid out again in the middle of a slide.
	// Between the stops (-1) the logo stays where it is.
	useAnimatedReaction(
		() => {
			const now = height.value
			if (snap.value === SheetSnap.Expanded && Math.abs(now - expandedHeight) <= 1) {
				return SheetSnap.Expanded
			}
			if (now >= collapsedHeight - 1 && snap.value !== SheetSnap.Expanded) {
				return SheetSnap.Collapsed
			}
			if (snap.value === SheetSnap.Mini && Math.abs(now - miniHeight) <= 1) {
				return SheetSnap.Mini
			}
			return -1
		},
		(stop, before) => {
			if (stop !== -1 && stop !== before) scheduleOnRN(setLogoStop, stop)
		},
		[collapsedHeight, miniHeight, expandedHeight]
	)

	return { height, snap, onScreen, logoStop }
}

/**
 * The tablet's left column: the sheet stands there instead of across the bottom of the screen,
 * its bottom edge `bottom` points up from the screen's and `tucked` points below the top of the
 * card with the years slider and the tab bar, which stays in front of it.
 */
export type SheetColumn = {
	left: number
	width: number
	bottom: number
	tucked: number
}

type NearbyPhotosSheetProps = {
	nearby: NearbySearch
	onOpenPhoto: (cid: string, title: string) => void
	/** How far the sheet's top stands above its bottom edge; the phone map's buttons ride on it. */
	height: SharedValue<number>
	snap: SharedValue<SheetSnap>
	miniHeight: number
	collapsedHeight: number
	expandedHeight: number
	/** The tablet's left column; without it, the phone's whole width, over the tab bar. */
	column?: SheetColumn
}

const Separator = () => <Spacer height={16} />
const CardSeparator = () => <Spacer width={CARD_GAP} />

type PhotoCardProps = {
	item: NearbyItem
	width: number
	height: number
	onPress: (cid: string, title: string) => void
}

/**
 * The picture of a card or a row, a spinner under it while it loads (cards only). Its parent keys
 * it by the photo, so a failure on one photo does not stick to the next in the same place.
 */
const FramePhoto: FC<{ uri: string; iconSize: number; spinner: boolean }> = ({
	uri,
	iconSize,
	spinner
}) => {
	const { colors } = useTheme()
	const [failed, setFailed] = useState(false)
	// Removed photos keep their title but lose their files.
	if (failed) {
		return <MaterialIcons name="no-photography" size={iconSize} color={colors.textThird} />
	}
	return (
		<>
			{spinner && <ActivityIndicator color={colors.textThird} />}
			<Image
				source={{ uri }}
				style={StyleSheet.absoluteFill}
				contentFit="cover"
				cachePolicy="disk"
				transition={200}
				onError={() => setFailed(true)}
			/>
		</>
	)
}

/**
 * A card of the low sheet. The frame stays in its place from one list to the next; the photo in
 * it is keyed by the photo, so a new one dissolves in over the old. The year changes at once.
 */
const PhotoCard: FC<PhotoCardProps> = ({ item, width, height, onPress }) => {
	const { colors } = useTheme()
	const years = formatNearbyYears(item)
	return (
		<TouchableOpacity
			onPress={() => onPress(item.cid, item.title)}
			accessibilityRole="button"
			accessibilityLabel={`${item.title}, ${years}`}
		>
			<View
				style={[s.card, { width, height, backgroundColor: colors.baseFifth }]}
			>
				<Animated.View
					key={item.cid}
					style={[s.swap, s.cardPhoto]}
					entering={PHOTO_IN}
					exiting={PHOTO_OUT}
				>
					{/* The standard size: the card is several times larger than a list thumbnail. */}
					<FramePhoto
						uri={`https://img.pastvu.com/d/${item.file}`}
						iconSize={32}
						spinner
					/>
				</Animated.View>
				<View style={[s.yearBadge, { backgroundColor: colors.backgroundApp }]}>
					<Text style={[s.yearText, { color: colors.textFirst }]}>{years}</Text>
				</View>
			</View>
		</TouchableOpacity>
	)
}

/** A row of the list, looking like the collection's: only its thumbnail swaps with a new photo. */
const NearbyRow: FC<{ item: NearbyItem; onPress: (cid: string, title: string) => void }> = ({
	item,
	onPress
}) => {
	const { colors } = useTheme()
	return (
		<TouchableOpacity
			style={row.mainContainer}
			onPress={() => onPress(item.cid, item.title)}
			accessibilityRole="button"
			accessibilityLabel={item.title}
		>
			<View style={[row.image, s.rowThumb, { backgroundColor: colors.baseFifth }]}>
				<Animated.View
					key={item.cid}
					style={[s.swap, s.rowPhoto]}
					entering={PHOTO_IN}
					exiting={PHOTO_OUT}
				>
					<FramePhoto
						uri={`https://img.pastvu.com/h/${item.file}`}
						iconSize={28}
						spinner={false}
					/>
				</Animated.View>
			</View>
			<Spacer width={12} />
			<View style={row.infoContainer}>
				<Text numberOfLines={1} style={[row.titleText, { color: colors.textFirst }]}>
					{item.title}
				</Text>
				<Spacer height={4} />
				<Text numberOfLines={2} style={[row.descriptionText, { color: colors.textThird }]}>
					{`${formatNearbyYears(item)} · ${formatDistance(item.distance)}`}
				</Text>
			</View>
		</TouchableOpacity>
	)
}

// By position, not by photo: the cards and rows keep their places when a new list comes, and only
// what is in them changes.
const keyByPosition = (_item: NearbyItem, index: number) => String(index)

/**
 * Photos around the centre of the map. On the phone it covers the bottom of the screen and the tab
 * bar, rendered through a portal; on the tablet it rises in the left column from behind the card
 * of the years slider and the tab bar, which it never covers. The map
 * screen opens and closes it (see useNearbySheet); here it is dragged by its grabber between a low
 * row of large photos, the list at its opening height and the list up to the search field.
 * Pulled down from the list it stops at the row of photos; only from there does it close.
 *
 * The sheet is as tall as when expanded and slides rather than resizes, so dragging never lays the
 * list out again. While collapsed, the part below its bottom edge gets extra list padding instead,
 * so the last row can still scroll into view.
 */
export const NearbyPhotosSheet: FC<NearbyPhotosSheetProps> = observer(
	({
		nearby,
		onOpenPhoto,
		height,
		snap,
		miniHeight,
		collapsedHeight,
		expandedHeight,
		column
	}) => {
		const { colors } = useTheme()
		const { bottom: safeBottom } = useSafeAreaInsets()
		const { width: screenWidth } = useSafeAreaFrame()
		// The strip at the bottom that holds nothing: the home indicator's on the phone, the part
		// behind the slider's card on the tablet.
		const bottom = column ? column.tucked : safeBottom
		const card = cardSize(column ? column.width : screenWidth)
		const [expanded, setExpanded] = useState(false)
		// The low sheet shows cards instead of rows; they swap half-way between the two stops.
		const [showCards, setShowCards] = useState(false)
		const cardsShown = useSharedValue(false)
		// Moved by hand since it opened. Until then the content does not fade with the height, so the
		// opening slide, which passes half-way too, shows it as before.
		const moved = useSharedValue(false)
		// The rows are first drawn once the sheet has slid in: mounting them mid-slide costs frames.
		const [arrived, setArrived] = useState(false)
		const dragging = useSharedValue(false)
		const dragStart = useSharedValue(0)
		// The stop a drag began at: one gesture moves the sheet one stop, so only a drag that began at
		// the row of cards can close it, however fast or far a drag from the list goes.
		const dragFrom = useSharedValue<SheetSnap>(SheetSnap.Closed)
		// The store stays on the JS thread: the worklets below never see it, only this function.
		const close = nearby.close
		const photos = nearby.photos
		const failed = nearby.failed

		useAnimatedReaction(
			() => snap.value === SheetSnap.Expanded,
			(now, before) => {
				if (now !== before) scheduleOnRN(setExpanded, now)
			}
		)
		// Cards below half-way when dragged or heading for the row of cards, the list above it. Below
		// half-way on the way up, or while opening, it keeps what it shows; a sheet sliding away too.
		useAnimatedReaction(
			() => {
				const below = height.value < (miniHeight + collapsedHeight) / 2
				if (snap.value === SheetSnap.Closed) return cardsShown.value
				if (below && (dragging.value || snap.value === SheetSnap.Mini)) return true
				return below ? cardsShown.value : false
			},
			(now, before) => {
				if (now === before) return
				cardsShown.value = now
				scheduleOnRN(setShowCards, now)
			},
			[miniHeight, collapsedHeight]
		)

		// Each fades out on its own side of half-way, so whichever one is on screen when they swap is
		// out of sight. A sheet sliding away keeps its content as it is.
		const listFade = useAnimatedStyle(() => {
			if (!moved.value || snap.value === SheetSnap.Closed) return { opacity: 1 }
			const half = (miniHeight + collapsedHeight) / 2
			return {
				opacity: interpolate(
					height.value,
					[half + SWAP_BAND, collapsedHeight],
					[0, 1],
					Extrapolation.CLAMP
				)
			}
		})
		const cardsFade = useAnimatedStyle(() => {
			if (!moved.value || snap.value === SheetSnap.Closed) return { opacity: 1 }
			const half = (miniHeight + collapsedHeight) / 2
			return {
				opacity: interpolate(
					height.value,
					[miniHeight, half - SWAP_BAND],
					[1, 0],
					Extrapolation.CLAMP
				)
			}
		})

		// The pictures fetched ahead of a new list are the ones this mode shows.
		useEffect(() => {
			nearby.cards = showCards
		}, [nearby, showCards])

		// A different list starts from its nearest photo, not wherever the old one was scrolled to.
		const listRef = useRef<FlatList<NearbyItem>>(null)
		const cardsRef = useRef<FlatList<NearbyItem>>(null)
		const version = nearby.version
		useEffect(() => {
			listRef.current?.scrollToOffset({ offset: 0, animated: true })
			cardsRef.current?.scrollToOffset({ offset: 0, animated: true })
		}, [version])

		// Unmounted once it has slid away: the region is gathered again without the anchor, so the map
		// is transparent again and the buttons are counted at their resting place.
		useEffect(() => () => refreshWindowRegion(), [])

		// Laid out and about to be drawn: a sheet just opened slides in from here, so the slide is
		// seen from its first frame instead of starting while it was still mounting.
		const onAnchorLayout = useCallback(() => {
			refreshWindowRegion()
			// Mounted with no height means it has just been opened. On the tablet, which mounts it in
			// the opening commit itself, this layout can come before the screen's effect has set the
			// stop, so the stop is set here too rather than waited for.
			// Closed again before this first layout: it only waits to be unmounted.
			if (height.value === 0 && !nearby.open) return
			if (height.value === 0) {
				if (snap.value === SheetSnap.Closed) snap.value = SheetSnap.Collapsed
				// Also when cut short by a drag, or the rows would never come.
				height.value = withTiming(collapsedHeight, SHEET_TIMING, () => {
					scheduleOnRN(setArrived, true)
				})
			} else {
				setArrived(true)
			}
		}, [snap, height, collapsedHeight, nearby])

		const moveTo = useCallback(
			(to: SheetSnap) => {
				'worklet'
				moved.value = true
				snap.value = to
				height.value = withTiming(
					to === SheetSnap.Expanded
						? expandedHeight
						: to === SheetSnap.Collapsed
							? collapsedHeight
							: to === SheetSnap.Mini
								? miniHeight
								: 0,
					SHEET_TIMING
				)
			},
			[moved, snap, height, expandedHeight, collapsedHeight, miniHeight]
		)

		const gesture = useMemo(() => {
			const pan = Gesture.Pan()
				.onStart(event => {
					if (snap.value === SheetSnap.Closed) return
					cancelAnimation(height)
					moved.value = true
					dragging.value = true
					dragFrom.value = snap.value
					// The pan starts once the finger has moved a little; count from where the sheet is now.
					dragStart.value = height.value + event.translationY
				})
				.onUpdate(event => {
					if (!dragging.value) return
					// Only from the row of cards does it follow the finger all the way down.
					const lowest =
						dragFrom.value === SheetSnap.Mini ? 0 : miniHeight - OVERDRAG
					height.value = Math.min(
						Math.max(dragStart.value - event.translationY, lowest),
						expandedHeight
					)
				})
				.onEnd((event, success) => {
					if (!dragging.value) return
					dragging.value = false
					if (!success) {
						moveTo(snap.value)
						return
					}
					const current = height.value
					const from = dragFrom.value
					let to: SheetSnap
					// A flick goes one stop on from where the drag began: down from the list to the row
					// of cards, and only from the row of cards away; up from the cards to the list.
					if (event.velocityY > FLING_VELOCITY) {
						to =
							from === SheetSnap.Expanded
								? SheetSnap.Collapsed
								: from === SheetSnap.Collapsed
									? SheetSnap.Mini
									: SheetSnap.Closed
					} else if (event.velocityY < -FLING_VELOCITY) {
						to = from === SheetSnap.Mini ? SheetSnap.Collapsed : SheetSnap.Expanded
					} else if (from === SheetSnap.Mini && current < miniHeight * CLOSE_SHARE) {
						to = SheetSnap.Closed
					} else if (current < (miniHeight + collapsedHeight) / 2) {
						to = SheetSnap.Mini
					} else {
						to =
							current > (collapsedHeight + expandedHeight) / 2
								? SheetSnap.Expanded
								: SheetSnap.Collapsed
					}
					moveTo(to)
					if (to === SheetSnap.Closed) scheduleOnRN(close)
				})
			const tap = Gesture.Tap().onEnd((_event, success) => {
				if (!success || snap.value === SheetSnap.Closed) return
				moveTo(snap.value === SheetSnap.Collapsed ? SheetSnap.Expanded : SheetSnap.Collapsed)
			})
			return Gesture.Race(pan, tap)
		}, [
			snap,
			height,
			moved,
			dragging,
			dragStart,
			dragFrom,
			moveTo,
			close,
			miniHeight,
			collapsedHeight,
			expandedHeight
		])

		// VoiceOver and TalkBack cannot drag: activating the grabber does what a tap on it does.
		const onAccessibilityAction = (event: AccessibilityActionEvent) => {
			if (event.nativeEvent.actionName !== 'activate') return
			if (snap.value === SheetSnap.Closed) return
			moveTo(snap.value === SheetSnap.Collapsed ? SheetSnap.Expanded : SheetSnap.Collapsed)
		}

		const sheetStyle = useAnimatedStyle(() => ({
			transform: [{ translateY: expandedHeight - height.value }]
		}))

		const renderItem = useCallback(
			({ item }: { item: NearbyItem }) => <NearbyRow item={item} onPress={onOpenPhoto} />,
			[onOpenPhoto]
		)

		const renderCard = useCallback(
			({ item }: { item: NearbyItem }) => (
				<PhotoCard
					item={item}
					width={card.width}
					height={card.height}
					onPress={onOpenPhoto}
				/>
			),
			[onOpenPhoto, card.width, card.height]
		)

		// Messages sit in the part that shows at the current stop, above the empty bottom strip.
		const status = (content: ReactNode) => (
			<View
				style={[
					s.status,
					{
						height:
							(showCards ? miniHeight : collapsedHeight) - HEADER_HEIGHT - bottom
					}
				]}
			>
				{content}
			</View>
		)

		// Google Maps draws into a SurfaceView, and Android recomputes which parts of the window are
		// transparent over it only when asked (see modules/window-region): the map would show through
		// the sheet and the buttons riding on it. This still view covers all the room they move in and
		// asks for that once laid out, before the slide; the sheet slides inside it.
		return (
			<View
				style={[
					s.regionAnchor,
					column
						? { left: column.left, width: column.width, bottom: column.bottom }
						: s.fullWidth,
					{ height: expandedHeight }
				]}
				pointerEvents="box-none"
				onLayout={onAnchorLayout}
			>
				<Animated.View
					style={[
						s.sheet,
						// Flat on the tablet, like the column's other cards; behind the slider's card a
						// shadow would also show down both its sides.
						!column && s.shadow,
						{ height: expandedHeight, backgroundColor: colors.backgroundApp },
						sheetStyle
					]}
				>
					<GestureDetector gesture={gesture}>
						<View
							style={s.header}
							accessible
							accessibilityRole="button"
							accessibilityLabel={t('photo.nearby')}
							accessibilityActions={ACCESSIBILITY_ACTIONS}
							onAccessibilityAction={onAccessibilityAction}
						>
							<View
								style={[s.grabber, { backgroundColor: colors.textThird }]}
							/>
							{/* A new list is on its way; the one below stays until it comes. */}
							{nearby.loading && !!photos && arrived && (
								<ActivityIndicator
									size="small"
									color={colors.textThird}
									style={s.refreshing}
								/>
							)}
						</View>
					</GestureDetector>
					{/* A new one for each mode, fading with the height as a whole. The photos in it do not
					    fade on their own when it comes, and the one taken away goes at once: they would
					    otherwise stay behind, fading over the next. */}
					<LayoutAnimationConfig
						key={showCards ? 'cards' : 'list'}
						skipEntering
						skipExiting
					>
						<Animated.View style={[s.content, showCards ? cardsFade : listFade]}>
							{failed ? (
								status(
									<Text style={[s.message, { color: colors.textSecond }]}>
										{t('map.nearbyError')}
									</Text>
								)
							) : !photos || !arrived ? (
								status(<ActivityIndicator color={colors.textFirst} />)
							) : !photos.length ? (
								status(
									<Text style={[s.message, { color: colors.textSecond }]}>
										{t('map.nearbyEmpty')}
									</Text>
								)
							) : showCards ? (
								<FlatList
									ref={cardsRef}
									horizontal
									data={photos}
									keyExtractor={keyByPosition}
									renderItem={renderCard}
									ItemSeparatorComponent={CardSeparator}
									showsHorizontalScrollIndicator={false}
									snapToInterval={card.width + CARD_GAP}
									decelerationRate="fast"
									contentContainerStyle={s.cards}
									initialNumToRender={3}
									maxToRenderPerBatch={3}
									windowSize={5}
								/>
							) : (
								<FlatList
									ref={listRef}
									data={photos}
									keyExtractor={keyByPosition}
									renderItem={renderItem}
									ItemSeparatorComponent={Separator}
									contentContainerStyle={[
										s.list,
										{
											paddingBottom:
												bottom +
												16 +
												(expanded ? 0 : expandedHeight - collapsedHeight)
										}
									]}
									initialNumToRender={8}
									maxToRenderPerBatch={5}
									windowSize={5}
								/>
							)}
						</Animated.View>
					</LayoutAnimationConfig>
				</Animated.View>
			</View>
		)
	}
)

const s = StyleSheet.create({
	// Android counts a view as covering the map only if it has a background; 1/255 black is invisible.
	regionAnchor: {
		position: 'absolute',
		...Platform.select({ android: { backgroundColor: '#00000001' } })
	},
	fullWidth: { left: 0, right: 0, bottom: 0 },
	// Full width on a phone, as the confirmation and download sheets are, with their corners.
	sheet: {
		position: 'absolute',
		left: 0,
		right: 0,
		bottom: 0,
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24
	},
	// A shadow over the map; what keeps the sheet above the tab bar is the portal layer's elevation.
	shadow: {
		...Platform.select({
			android: { elevation: 12 },
			ios: {
				shadowColor: 'rgba(0, 0, 0, 0.12)',
				shadowOpacity: 1,
				shadowRadius: 12,
				shadowOffset: { width: 0, height: -4 }
			}
		})
	},
	header: { height: HEADER_HEIGHT, alignItems: 'center', paddingTop: 8 },
	grabber: { width: 36, height: 5, borderRadius: 2.5, opacity: 0.5 },
	// Beside the grabber, out of the way of the rows.
	refreshing: { position: 'absolute', right: 16, top: 12 },
	content: { flex: 1 },
	list: { paddingHorizontal: 16 },
	cards: { paddingHorizontal: 16 },
	// The photo that swaps inside a card or a thumbnail, filling it with its corners.
	swap: {
		position: 'absolute',
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
		overflow: 'hidden',
		alignItems: 'center',
		justifyContent: 'center'
	},
	cardPhoto: { borderRadius: 24 },
	rowPhoto: { borderRadius: 16 },
	rowThumb: { overflow: 'hidden' },
	// The photo lies over the spinner, clipped to the card's corners.
	card: {
		borderRadius: 24,
		overflow: 'hidden',
		alignItems: 'center',
		justifyContent: 'center'
	},
	// In the colours of the map's round buttons.
	yearBadge: {
		position: 'absolute',
		left: 10,
		bottom: 10,
		paddingHorizontal: 10,
		paddingVertical: 3,
		borderRadius: 10
	},
	yearText: { fontSize: 15, fontWeight: '700', lineHeight: 20 },
	status: {
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: 24
	},
	message: {
		fontSize: 14,
		lineHeight: 20,
		fontWeight: '500',
		textAlign: 'center'
	}
})
