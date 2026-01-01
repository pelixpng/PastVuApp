import { StyleSheet } from 'react-native'

export const s = StyleSheet.create({
  commentContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    marginLeft: 'auto',
    zIndex: -1,
  },
  width94: { width: '94%' },
  width100: { width: '100%' },
  image: {
    width: 40,
    height: 40,
    borderRadius: 200,
  },
  commentTextContainer: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
  nameText: {
    fontWeight: '800',
    fontSize: 13,
    lineHeight: 20,
  },
  dateText: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '500',
  },
})
