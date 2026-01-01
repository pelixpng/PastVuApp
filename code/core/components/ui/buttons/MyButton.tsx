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
      <Text style={s.text}>{title}</Text>
    </TouchableOpacity>
  )
}

const s = StyleSheet.create({
  text: {
    fontSize: 14,
    lineHeight: 24,
    fontWeight: '800',
    color: 'white',
  },
  flex: { flex: 1 },
  block: {
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#428BF9',
  },
})
