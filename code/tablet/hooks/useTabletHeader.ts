import { useMemo } from 'react'
import { Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { topOnUnfoldedCameraLine, UNFOLDED_STATUS_BAR_WIDTH } from '../../core/utils/sideCamera'

/** React Navigation's header height on an iPad, which the tablet interface is laid out for. */
const TABLET_HEADER_HEIGHT = 50

/**
 * The tablet interface's header on an iPhone that unfolds to a wide screen (iPhone Duo).
 * - `style`: React Navigation picks the height by idiom and gives a phone on its side 32 pt, too
 *   low for the header's 44 pt buttons, so it gets the iPad's 50 instead.
 * - In portrait the top inset holds only the status bar, on the right: the header moves up into it
 *   (`statusBarHeight`), level with the camera, and its buttons keep clear of the status bar
 *   (`rightContainer`).
 *
 * Empty on an iPad and on Android, which already get their own. Needs the tablet's safe-area insets
 * above, for the top inset it stands below.
 */
export const useTabletHeader = () => {
	const { top } = useSafeAreaInsets()
	const phone = Platform.OS === 'ios' && !Platform.isPad
	return useMemo(() => {
		if (!phone) return {}
		const lineTop = topOnUnfoldedCameraLine(top, TABLET_HEADER_HEIGHT)
		return lineTop === null
			? { style: { height: TABLET_HEADER_HEIGHT + top } }
			: {
					style: { height: TABLET_HEADER_HEIGHT + lineTop },
					statusBarHeight: lineTop,
					rightContainer: { marginEnd: UNFOLDED_STATUS_BAR_WIDTH }
				}
	}, [phone, top])
}
