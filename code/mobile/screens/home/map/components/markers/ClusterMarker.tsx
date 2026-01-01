import { FC } from 'react'
import { StyleSheet, Text, View } from 'react-native'

type Props = {
  count: number
  borderColor: string
}

export const ClusterMarker: FC<Props> = ({ count, borderColor }) => {
  return (
    <View style={s.block}>
      <Text style={s.text}>{count}</Text>
      <View style={[s.background, { borderColor }]} />
    </View>
  )
}

const s = StyleSheet.create({
  text: {
    color: 'white',
    fontSize: 11,
    textAlign: 'center',
  },
  block: {
    width: 30,
    height: 30,
    backgroundColor: '#7A79A2',
    borderRadius: 60,
    justifyContent: 'center',
  },
  background: {
    width: 30,
    height: 30,
    borderWidth: 2,
    borderRadius: 60,
    position: 'absolute',
  },
})
