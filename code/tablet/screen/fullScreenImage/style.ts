import { StyleSheet } from 'react-native'

export const s = StyleSheet.create({
  background: {
    position: 'absolute',
    backgroundColor: 'black',
    width: '100%',
    height: '100%',
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
