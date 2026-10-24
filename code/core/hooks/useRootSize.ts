import { Platform, useWindowDimensions } from 'react-native'
import { useSafeAreaFrame } from 'react-native-safe-area-context'

/**
 * The size the app is laid out in, for components shared by the phone and the tablet. Screens of
 * the tablet alone take useSafeAreaFrame directly.
 *
 * Not useWindowDimensions on iOS: React Native refreshes Dimensions there when the device turns,
 * the window is resized or the app comes back to the foreground, but not when the app turns its
 * interface itself, as the tablet does at launch through expo-screen-orientation. A tablet started
 * in portrait kept the portrait size after turning to landscape. The safe-area frame is measured
 * from the root view and follows it; on the iPhone it is the window's size anyway.
 *
 * Android refreshes Dimensions on every rotation, and its window can be shorter than the
 * edge-to-edge root view (without the navigation bar), so it keeps the window: phones lay out as
 * before.
 */
export const useRootSize = () => {
  const frame = useSafeAreaFrame()
  const window = useWindowDimensions()
  const { width, height } = Platform.OS === 'ios' ? frame : window
  return { width, height }
}
