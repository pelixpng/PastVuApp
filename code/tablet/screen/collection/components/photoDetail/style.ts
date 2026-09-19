import { StyleSheet } from 'react-native'

export const s = StyleSheet.create({
  modal: {
    height: '100%',
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // 44 pt buttons around 24 pt glyphs: 6 keeps the glyphs 16 from the edges.
    paddingHorizontal: 6,
    width: '100%',
    height: 44,
    alignItems: 'center',
  },
  iconContainer: { flexDirection: 'row' },
  postInfoContainer: { paddingHorizontal: 16 },
  titleText: {
    fontSize: 20,
    lineHeight: 20,
    fontWeight: '800',
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
