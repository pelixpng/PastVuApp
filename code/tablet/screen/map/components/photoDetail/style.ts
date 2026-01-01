import { StyleSheet } from 'react-native'

export const s = StyleSheet.create({
  modal: {
    height: '100%',
    width: '64%',
    position: 'absolute',
    zIndex: 50,
    right: 0,
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
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 20,
  },
  loaderContainer: {
    width: '100%',
    height: '100%',
    paddingHorizontal: 16,
    position: 'absolute',
    zIndex: 40,
  },
})
