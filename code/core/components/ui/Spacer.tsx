import { View } from 'react-native'
import { FC } from 'react'

type SpacerProps = {
  width?: number
  height?: number
}
export const Spacer: FC<SpacerProps> = props => {
  return <View style={[{ width: props.width, height: props.height }]} />
}
