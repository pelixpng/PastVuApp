import { StyleSheet } from 'react-native'

/** The header row's padding on each side. */
export const HEADER_SIDE = 6
/** The post list's side padding: the post's column is the panel's width less twice this. */
export const POST_PADDING = 16

export const s = StyleSheet.create({
  // Pinned to the right edge; the width comes from the tablet layout.
  modal: {
    height: '100%',
    position: 'absolute',
    zIndex: 50,
    right: 0,
  },
  // Clips the slide to the panel's final area, so the post appears to come in from the screen edge.
  slideFrame: { overflow: 'hidden' },
  // A background makes Android count this view as covering the map when it gathers the window's
  // transparent region. 1/255 black is invisible over the map and under the panel.
  regionAnchor: { backgroundColor: '#00000001' },
  panel: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  layer: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // 44 pt buttons around 24 pt glyphs: 6 keeps the glyphs 16 from the edges.
    paddingHorizontal: HEADER_SIDE,
    width: '100%',
    height: 44,
    alignItems: 'center',
  },
  iconContainer: { flexDirection: 'row' },
  postInfoContainer: { paddingHorizontal: POST_PADDING },
  loaderContainer: {
    width: '100%',
    height: '100%',
    paddingHorizontal: 16,
    position: 'absolute',
    zIndex: 40,
  },
})
