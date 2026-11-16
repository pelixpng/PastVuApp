import { FC } from 'react'
import { ActivityIndicator, StyleSheet } from 'react-native'
import Animated, { FadeOut } from 'react-native-reanimated'
import { useTheme } from '@react-navigation/native'

const COVER_OUT = FadeOut.duration(250)

/**
 * Covers a picture while it loads, in the screen's colour rather than the black behind the picture,
 * and fades away once it has: a black box flashing up for a second looked broken. Render it over the
 * picture's box only while loading; it lets touches through.
 */
export const LoadingCover: FC = () => {
  const { colors } = useTheme()
  return (
    <Animated.View
      pointerEvents="none"
      exiting={COVER_OUT}
      style={[StyleSheet.absoluteFill, s.centre, { backgroundColor: colors.backgroundApp }]}>
      <ActivityIndicator color={colors.textThird} />
    </Animated.View>
  )
}

const s = StyleSheet.create({
  centre: { justifyContent: 'center', alignItems: 'center' },
})
