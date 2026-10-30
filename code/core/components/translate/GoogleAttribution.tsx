import { FC } from 'react'
import { Image, StyleSheet } from 'react-native'
import { useTheme } from '@react-navigation/native'

const GREY = require('../../../assets/translate/translated-by-google-grey.png')
const WHITE = require('../../../assets/translate/translated-by-google-white.png')

/** The badges' own proportions, 366 × 48 at @3x. */
const ASPECT = 366 / 48

/**
 * Google's "translated by Google" badge, which its terms require next to every translation it
 * makes. Of the styles Google allows, the grey one on light backgrounds and the white one on dark:
 * they sit with the grey links around them, where the full-colour logo stood out. Shown as Google
 * ships it, only scaled.
 */
export const GoogleAttribution: FC<{ height?: number }> = ({ height = 14 }) => {
  const { dark } = useTheme()
  return (
    <Image
      source={dark ? WHITE : GREY}
      style={[s.badge, { height, width: height * ASPECT }]}
      resizeMode="contain"
      accessible
      accessibilityLabel="translated by Google"
    />
  )
}

const s = StyleSheet.create({
  badge: { alignSelf: 'flex-start' },
})
