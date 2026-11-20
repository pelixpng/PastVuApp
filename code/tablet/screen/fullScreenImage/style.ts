import { StyleSheet } from 'react-native'

/** 44 pt buttons around 24 pt glyphs: 6 keeps the glyphs 16 from the edges. */
export const HEADER_SIDE = 6

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
    paddingHorizontal: HEADER_SIDE,
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
