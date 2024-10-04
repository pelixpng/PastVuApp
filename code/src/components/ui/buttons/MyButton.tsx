import { FC } from 'react'
import { Text, StyleSheet, TouchableOpacity } from 'react-native'

type ButtonProps = {
  title: string
  func: () => void
  children?: React.ReactNode
}

export const MyButton: FC<ButtonProps> = ({ title, func, children }) => {
  return (
    <TouchableOpacity style={s.block} onPress={func}>
      {children}
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
  block: {
    width: '100%',
    height: 44,
    gap: 8,
    flexDirection: 'row',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#428BF9',
  },
})
