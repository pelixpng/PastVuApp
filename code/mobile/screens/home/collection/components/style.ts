import { StyleSheet } from 'react-native'

export const s = StyleSheet.create({
  image: {
    width: 80,
    height: 80,
    borderRadius: 16,
  },
  mainContainer: { flexDirection: 'row', alignItems: 'center' },
  infoContainer: { flex: 1 },
  removeButton: {
    padding: 6,
  },
  titleText: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '800',
  },
  descriptionText: {
    fontWeight: '500',
    fontSize: 13,
    lineHeight: 20,
  },
})
