import { StyleSheet } from 'react-native'
import { SIZE } from '../../../constants/sizes'

export const s = StyleSheet.create({
  background: {
    position: 'absolute',
    backgroundColor: 'black',
    width: SIZE.WINDOW_WIDTH,
    height: SIZE.SCREEN_HEIGHT,
  },
  content: {
    height: SIZE.WINDOW_HEIGHT,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    position: 'absolute',
    top: 0,
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 1,
  },
  actionIcons: {
    flexDirection: 'row',
  },
})
