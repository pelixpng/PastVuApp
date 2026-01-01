import { StyleSheet } from 'react-native'

export const s = StyleSheet.create({
  modal: {
    height: '100%',
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    width: '100%',
    height: 40,
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
})
