import { FC } from 'react'
import { Text, StyleSheet, TouchableOpacity } from 'react-native'

type ButtonProps = {
  title: string
  func: () => void
  fullWidth?: boolean
}

export const MyButton: FC<ButtonProps> = ({ title, func, fullWidth }) => {
  return (
    <TouchableOpacity style={[s.block, fullWidth && s.flex]} onPress={func}>
      {/* One line, shrunk a little when a label is longer than the button (some are required word
          for word, like the link to Yandex Maps' terms), instead of running past its edges. */}
      <Text style={s.text} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>
        {title}
      </Text>
    </TouchableOpacity>
  )
}

const s = StyleSheet.create({
  text: {
    // Centred inside its own box too: a shrunk label keeps the box's full width.
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 24,
    fontWeight: '800',
    color: 'white',
  },
  flex: { flex: 1 },
  block: {
    height: 44,
    paddingHorizontal: 12,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#428BF9',
  },
})
