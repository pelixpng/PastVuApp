import { Dimensions } from 'react-native'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('screen')
const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get('window')

export const SIZE = {
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  WINDOW_WIDTH,
  WINDOW_HEIGHT,
}
