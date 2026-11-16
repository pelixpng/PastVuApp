import { useMemo } from 'react'
import { Platform, StyleProp, ViewStyle, useWindowDimensions } from 'react-native'

/** react-navigation's own threshold (IPAD_MINI_MEDIUM_WIDTH in its Header). */
const WIDE_HEADER_WIDTH = 414
/** The side margin its iOS header row gains from that width on. */
const WIDE_HEADER_INSET = 5

type HeaderEdgeStyles = {
  headerLeftContainerStyle?: StyleProp<ViewStyle>
  headerRightContainerStyle?: StyleProp<ViewStyle>
  headerTitleContainerStyle?: StyleProp<ViewStyle>
}

/**
 * Header container styles that keep the header's buttons and a left-aligned title on the same
 * 16 pt gutter as the content below.
 *
 * On iOS react-navigation insets the whole header row by another 5 pt once the screen is 414 pt
 * wide: every iPad, the Plus and Max iPhones, any iPhone on its side. Relative offsets move the
 * containers back by that much and leave their margins alone, as those carry the safe-area insets
 * of a phone in landscape. A centred title stays centred by itself and is not moved.
 *
 * The styles keep their identity from one render to the next, so a screen can pass them to
 * setOptions from an effect that depends on them.
 */
export const useHeaderEdgeStyles = (titleAlign: 'left' | 'center'): HeaderEdgeStyles => {
  const { width } = useWindowDimensions()
  const wide = Platform.OS === 'ios' && width >= WIDE_HEADER_WIDTH
  return useMemo(
    () =>
      wide
        ? {
            headerLeftContainerStyle: { start: -WIDE_HEADER_INSET },
            headerRightContainerStyle: { end: -WIDE_HEADER_INSET },
            headerTitleContainerStyle:
              titleAlign === 'left' ? { start: -WIDE_HEADER_INSET } : undefined,
          }
        : {},
    [wide, titleAlign],
  )
}
