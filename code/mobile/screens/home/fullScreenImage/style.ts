import { StyleSheet } from 'react-native'

export const s = StyleSheet.create({
  background: {
    position: 'absolute',
    backgroundColor: 'black',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // 44 pt buttons around 24 pt glyphs: 6 keeps the glyphs 16 from the edges.
    paddingHorizontal: 6,
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
