import { FC } from 'react'
import { Pressable, StyleSheet } from 'react-native'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'

type Props = {
  name: keyof typeof MaterialIcons.glyphMap
  color: string
  onPress?: () => void
  accessibilityLabel?: string
}

/** Apple's and Google's minimum touch target; the glyph itself is only 24 pt. */
const HIT_SIZE = 44

/**
 * A header action with a full-size touch target.
 *
 * `MaterialIcons` with `onPress` only responds on the 24 pt glyph, which is why taps kept missing.
 * The 44 pt box keeps the glyphs where they were: with a 4 pt gap between boxes the centres are
 * 48 pt apart, the same pitch as the old 24 pt icons with 24 pt spacers.
 */
export const HeaderIconButton: FC<Props> = ({ name, color, onPress, accessibilityLabel }) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={accessibilityLabel}
    hitSlop={4}
    style={({ pressed }) => [s.button, pressed && s.pressed]}>
    <MaterialIcons name={name} size={24} color={color} />
  </Pressable>
)

const s = StyleSheet.create({
  button: {
    width: HIT_SIZE,
    height: HIT_SIZE,
    borderRadius: HIT_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressed: { opacity: 0.5 },
})
