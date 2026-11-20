import { StyleSheet } from 'react-native'

/** The pane's side padding: the post's content column is the pane's width less twice this. */
export const PANE_PADDING = 16

export const s = StyleSheet.create({
  // The pane right of the list. Holds the post and, over it, then-and-now; no padding, so the
  // cover lines up with the post. Its width comes from PhotoDetail.
  frame: { height: '100%' },
  modal: {
    height: '100%',
    paddingHorizontal: PANE_PADDING,
  },
  cover: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
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
