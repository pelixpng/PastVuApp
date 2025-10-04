import { StyleSheet } from 'react-native'

export const s = StyleSheet.create({
  textBlock: { flex: 1 },
  bgIcon: {
    width: 48,
    height: 48,
    borderRadius: 100,
    backgroundColor: '#428BF9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  titleText: {
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '800',
  },
  descriptionText: {
    fontWeight: '400',
    fontSize: 13,
    lineHeight: 20,
  },
})
