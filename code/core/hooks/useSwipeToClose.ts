import {
  Extrapolation,
  interpolate,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { scheduleOnRN } from 'react-native-worklets'
import type { CommonZoomState } from 'react-native-zoom-toolkit'

/** How far a swipe pulls the photo before the screen closes, in points. */
const CLOSE_DISTANCE = 125
/** At or this close to 1, the photo is at its base zoom. */
const BASE_ZOOM_TOLERANCE = 0.001

const fadeFor = (offset: number) => {
  'worklet'
  return interpolate(Math.abs(offset), [0, CLOSE_DISTANCE], [1, 0], Extrapolation.CLAMP)
}

/**
 * Swipe-to-close for a full-screen photo, as in Telegram. At its base zoom the photo follows the
 * finger up or down, and it and the black background fade out as it goes. Pulled further than
 * CLOSE_DISTANCE, it flies off that way and the screen closes; let go sooner, it slides back.
 *
 * ResumableZoom reports the drag through onOverPanning. At base zoom the photo fits the screen and
 * has nowhere to pan, so the whole drag goes past its edge. Zoomed in, the same callback fires when
 * panning reaches an edge, which is not a swipe, so it only counts at base zoom. Spread the
 * returned callbacks onto ResumableZoom: onUpdate and onOverPanning run on the UI thread.
 */
export const useSwipeToClose = (screenHeight: number, onClose: () => void) => {
  const translateY = useSharedValue(0)
  const isClosing = useSharedValue(false)
  const zoomScale = useSharedValue(1)

  useAnimatedReaction(
    () => isClosing.value,
    closing => {
      if (closing) scheduleOnRN(onClose)
    },
    [onClose],
  )

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: fadeFor(translateY.value),
  }))

  const backgroundStyle = useAnimatedStyle(() => ({ opacity: fadeFor(translateY.value) }))

  const onUpdate = (state: CommonZoomState<number>) => {
    'worklet'
    zoomScale.value = state.scale
  }

  const onOverPanning = (_x: number, y: number) => {
    'worklet'
    if (isClosing.value || Math.abs(zoomScale.value - 1) > BASE_ZOOM_TOLERANCE) return
    if (Math.abs(y) > CLOSE_DISTANCE) {
      isClosing.value = true
      translateY.value = withTiming(Math.sign(y) * screenHeight, { duration: 150 })
      return
    }
    translateY.value = y
  }

  // Once the finger lifts, or a second one turns the drag into a pinch.
  const onPanEnd = () => {
    if (!isClosing.value) translateY.value = withTiming(0, { duration: 200 })
  }

  return {
    contentStyle,
    backgroundStyle,
    zoomCallbacks: { onUpdate, onOverPanning, onPanEnd },
  }
}
