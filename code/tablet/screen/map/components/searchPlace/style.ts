import { StyleSheet } from 'react-native'

export const s = StyleSheet.create({
  container: {
    width: '33%',
    position: 'absolute',
    zIndex: 9,
    alignSelf: 'flex-start',
    left: 16,
  },
  list: {
    paddingTop: 12,
    paddingBottom: 16,
    paddingLeft: 20,
    paddingRight: 8,
    borderRadius: 12,
  },
  input: {
    fontSize: 13,
    fontWeight: 'medium',
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingLeft: 12,
    paddingRight: 8,
    height: 40,
    alignItems: 'center',
    borderRadius: 12,
  },
  rowContainer: {
    height: 20,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  ball: {
    width: 8,
    height: 8,
    borderRadius: 20,
    alignSelf: 'center',
  },
  resultText: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: 'medium',
  },
})
