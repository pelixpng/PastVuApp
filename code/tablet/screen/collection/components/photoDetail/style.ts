import { StyleSheet } from 'react-native'

export const s = StyleSheet.create({
  // Holds the post and, over it, then-and-now; no padding, so the cover lines up with the post.
  frame: { height: '100%' },
  modal: {
    height: '100%',
    paddingHorizontal: 16,
  },
  cover: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // 44 pt buttons around 24 pt glyphs: 6 keeps the glyphs 16 from the edges.
    paddingHorizontal: 6,
    width: '100%',
    height: 44,
    alignItems: 'center',
  },
  loaderContainer: {
    width: '110%',
    height: '100%',
    position: 'absolute',
    zIndex: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '500',
  },
})
