import { useMemo } from 'react'
import { useSafeAreaFrame, useSafeAreaInsets } from 'react-native-safe-area-context'

/**
 * How much width the tablet's window has for its two panes.
 * - `regular`, from 970 pt: the left column takes a third of the window and the right panel the
 *   rest, wide enough for then-and-now beside the column (about 620 pt and more).
 * - `medium`, below that: the column stays at its 320 pt minimum and the panel gets what is left.
 *   A window narrower than that column, its margins and a 364 pt panel (716 pt) is `medium` too:
 *   there the panel keeps its 364 pt and the column gets the rest, though never less than a third
 *   of the window. A 320 pt column would leave the panel too narrow for the post header's buttons,
 *   as on an 8-inch Android tablet in portrait (600 pt).
 */
export type TabletTier = 'regular' | 'medium'

export type TabletLayout = {
	/**
	 * The width the column and the tier are derived from: the root view's, less the side insets.
	 * Those are iPhone Duo's vertical bar (the status bar and the Dynamic Island in a column at the
	 * side, 84 pt), which the map and the right panes run under.
	 */
	width: number
	/** The side insets: the list and the menu keep `leftInset` from the left edge. */
	leftInset: number
	/** A pane reaching the right edge keeps the buttons of its header this far from the edge. */
	rightInset: number
	/** The root view's height. */
	height: number
	tier: TabletTier
	/** Where the map's left column starts, from the left edge, past the left inset. */
	columnLeft: number
	/**
	 * The map's left column (search, years slider, nearby photos), `columnLeft` from the left edge;
	 * the floating tab bar sits under it at the same width.
	 */
	columnWidth: number
	/**
	 * The right panel, from 16 pt past the column to the right edge: the photo panel on the map, and
	 * the pane beside the list on the collection, news and profile screens. It runs under iPhone
	 * Duo's vertical bar, as the map does; only its header's buttons keep `rightInset` from the edge.
	 */
	panelWidth: number
	/**
	 * The list on the collection, news and profile screens, from the left inset: its rows, 16 pt in
	 * from each side, line up with the floating tab bar under it.
	 */
	listWidth: number
	/** The settings menu, from the left inset; the details take the rest. */
	menuWidth: number
	/** The floating tab bar's place: `start` from the left edge, and its width. */
	tabBar: { start: number; width: number }
	/**
	 * `below-icon` where the bar is too narrow for its labels beside the icons, in either orientation:
	 * an iPad window that is not full screen can be narrow in landscape too. Otherwise left to
	 * bottom-tabs, which on a tablet puts them beside the icons, as on every full-screen iPad in
	 * landscape.
	 */
	labelPosition: 'below-icon' | undefined
	/**
	 * A window under 640 pt tall: the nearby photos' mini card, whose height grows with its width,
	 * is kept narrower so it leaves the map room.
	 */
	short: boolean
}

/** From this width on, a third of the window is at least the column's minimum. */
const REGULAR_MIN_WIDTH = 970
/**
 * The narrowest column in a window that has room for it beside a MIN_PANEL panel: a quarter of the
 * tab bar under it still holds 'Коллекция' and 'Настройки' whole under their icons, and the search
 * field and the years slider stay usable.
 */
const MIN_COLUMN = 320
/** The column's share of a `regular` window, and the least it takes of a narrower one. */
const COLUMN_SHARE = 0.33
/** The column's margin from the left edge, and again between the column and the panel. */
const EDGE = 16
/**
 * The narrowest panel the column gives way to: its header, 6 pt in from each side, still holds the
 * back arrow and the most 44 pt buttons a post shows, seven (see core/utils/headerGap).
 */
const MIN_PANEL = 364
/**
 * Narrower than this, the tab labels go under the icons: beside them 'Коллекция' does not fit in a
 * quarter of the bar and is cut short. Wider bars keep bottom-tabs' own choice.
 */
const LABELS_BESIDE_MIN_BAR = 360
const SHORT_HEIGHT = 640

/**
 * The narrowest window the tablet interface is laid out for on an iPad: the column at its minimum
 * and a MIN_PANEL panel beside it, with their margins. Narrower, the column's rows, cards and tab
 * labels break words apart. An iPad window is kept at least this wide (see SceneDelegate.swift).
 */
export const TABLET_MIN_WIDTH = 2 * EDGE + MIN_COLUMN + MIN_PANEL

/**
 * The narrowest window the tablet interface takes on an iPhone that unfolds to a wide screen
 * (iPhone Duo: 669 pt in portrait, 951 in landscape), with the column narrowed below MIN_COLUMN,
 * to about 264 pt at this width. The folded cover (382 pt beside its vertical bar) and a half of
 * Split View stay with the phone's interface (see App.tsx).
 */
export const UNFOLDED_MIN_WIDTH = 660

/**
 * The narrowest window the tablet interface takes on Android, in dp: the smallest width Android
 * calls a tablet's (react-native-device-info's test too), which MainActivity also locks phones
 * upright below. A foldable crosses it as it folds (see App.tsx).
 */
export const ANDROID_TABLET_MIN_WIDTH = 600

/**
 * The tablet's pane sizes for a window of this size. The tier follows the width alone, so the
 * Android keyboard, which shortens the window, never switches it. A `regular` window gets a column
 * of 0.33 of its width and a panel of 0.67 of it less 32 pt.
 */
export const tabletLayout = (
	frameWidth: number,
	height: number,
	leftInset = 0,
	rightInset = 0
): TabletLayout => {
	const width = frameWidth - leftInset - rightInset
	const tier: TabletTier = width >= REGULAR_MIN_WIDTH ? 'regular' : 'medium'
	const columnLeft = leftInset + EDGE
	// A third of the window, or MIN_COLUMN if that is wider. Where MIN_COLUMN would leave the panel
	// under MIN_PANEL, the column narrows instead, down to a third of the window, so the sizes
	// change smoothly with the width.
	const columnWidth = Math.max(
		width * COLUMN_SHARE,
		Math.min(MIN_COLUMN, width - 2 * EDGE - MIN_PANEL)
	)
	const panelLeft = columnLeft + columnWidth + EDGE
	return {
		width,
		leftInset,
		rightInset,
		height,
		tier,
		columnLeft,
		columnWidth,
		panelWidth: frameWidth - panelLeft,
		listWidth: columnWidth + 2 * EDGE,
		menuWidth: columnWidth + 2 * EDGE,
		tabBar: { start: columnLeft, width: columnWidth },
		labelPosition: columnWidth < LABELS_BESIDE_MIN_BAR ? 'below-icon' : undefined,
		short: height < SHORT_HEIGHT
	}
}

/**
 * The tablet's pane sizes for the current window, following every turn and resize. The screens
 * restyle from it and keep the same views, so a turn loses no scroll position, camera or Street
 * View.
 *
 * The root view's size, not Dimensions: see core/hooks/useRootSize. It needs a safe-area provider
 * above, as inside a navigator's screens; screen options built above every provider cannot use it
 * (see core/hooks/useHeaderEdgeStyles).
 */
export const useTabletLayout = (): TabletLayout => {
	const { width, height } = useSafeAreaFrame()
	const { left, right } = useSafeAreaInsets()
	return useMemo(() => tabletLayout(width, height, left, right), [width, height, left, right])
}
