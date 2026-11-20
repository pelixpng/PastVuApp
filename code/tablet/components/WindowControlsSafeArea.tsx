import { FC, PropsWithChildren, useMemo, useState } from 'react'
import { StyleSheet } from 'react-native'
import { SafeAreaInsetsContext, useSafeAreaInsets } from 'react-native-safe-area-context'
import { WindowControlsView } from '../../modules/window-region'

/**
 * Moves the top of the safe area below the window controls iPadOS 26 and later draws over the
 * top-left corner of a window that is not full screen (see modules/window-region). Everything
 * inside takes its top from here: the navigators' headers, the map's column and the photo panel.
 * The whole top edge moves, not only the corner, so the column and the panel keep one top line.
 * Full screen the controls sit in the status bar and nothing changes.
 *
 * Needs a SafeAreaProvider above; the navigators inside then use these insets instead of making
 * their own.
 */
export const WindowControlsSafeArea: FC<PropsWithChildren> = ({ children }) => {
	const insets = useSafeAreaInsets()
	const [controls, setControls] = useState(0)
	const value = useMemo(
		() => (controls > 0 ? { ...insets, top: insets.top + controls } : insets),
		[insets, controls]
	)
	return (
		<>
			{WindowControlsView && (
				<WindowControlsView
					style={StyleSheet.absoluteFill}
					pointerEvents="none"
					onControlsChange={event => setControls(event.nativeEvent.top)}
				/>
			)}
			<SafeAreaInsetsContext.Provider value={value}>{children}</SafeAreaInsetsContext.Provider>
		</>
	)
}
