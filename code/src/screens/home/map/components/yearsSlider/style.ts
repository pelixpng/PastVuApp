import { StyleSheet } from 'react-native'

export const s = StyleSheet.create({
  currentYearsText: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 20,
    textAlign: 'center',
  },
  thumb: { height: 16, width: 16 },
  containerSlider: {
    height: 25,
    width: '100%',
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  container: {
    paddingHorizontal: 24,
    paddingBottom: 8,
    paddingTop: 12,
    zIndex: 8,
    bottom: 0,
    position: 'absolute',
    borderTopRightRadius: 16,
    borderTopLeftRadius: 16,
    width: '100%',
  },
})
