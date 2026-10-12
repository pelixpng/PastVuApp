import { FC, ReactNode, useEffect, useState } from 'react'
import { LayoutChangeEvent, StyleSheet, View } from 'react-native'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { scheduleOnRN } from 'react-native-worklets'

const TIMING = { duration: 320, easing: Easing.out(Easing.cubic) }

type Props = {
  open: boolean
  /** The photo inside is being zoomed: it has to grow over the original, not under it. */
  raised: boolean
  children: ReactNode
}

/**
 * Opens room above the post for the colour version: everything below slides down by the photo's
 * height while the photo fades in, and slides back up when it closes.
 *
 * The photo stays mounted while shut (no height, clipped, so it takes no touches): mounting it on
 * every opening loaded it anew and made it flicker.
 */
export const ColourReveal: FC<Props> = ({ open, raised, children }) => {
  // Fully open: nothing to clip any more, and clipping would cut the zoomed photo off.
  const [settled, setSettled] = useState(false)
  const [measured, setMeasured] = useState(0)
  const contentHeight = useSharedValue(0)
  const progress = useSharedValue(0)

  useEffect(() => {
    if (open) {
      // The height comes from the photo's first layout; the slide starts once it is known.
      if (measured === 0) return
      progress.value = withTiming(1, TIMING, finished => {
        if (finished) scheduleOnRN(setSettled, true)
      })
    } else {
      setSettled(false)
      progress.value = withTiming(0, TIMING)
    }
  }, [open, measured, progress])

  const onLayout = (e: LayoutChangeEvent) => {
    contentHeight.value = e.nativeEvent.layout.height
    setMeasured(e.nativeEvent.layout.height)
  }

  const animated = useAnimatedStyle(() => ({
    height: progress.value * contentHeight.value,
    opacity: progress.value,
  }))

  return (
    <Animated.View
      style={[animated, { overflow: settled ? 'visible' : 'hidden', zIndex: raised ? 2 : 0 }]}>
      {/* Absolute, so it keeps its full height to be measured while the room is still shut. */}
      <View style={s.content} onLayout={onLayout}>
        {children}
      </View>
    </Animated.View>
  )
}

const s = StyleSheet.create({
  content: { position: 'absolute', top: 0, left: 0, right: 0 },
})
