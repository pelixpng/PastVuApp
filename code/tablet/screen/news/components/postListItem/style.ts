import { StyleSheet } from 'react-native'

export const s = StyleSheet.create({
  mainContainer: {
    padding: 16,
    borderRadius: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 99,
  },
  userNameText: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '800',
  },
  titleText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '800',
  },
  noticeContainer: {},
  showMoreGradient: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingLeft: 40,
  },
  showMoreText: {
    fontWeight: '800',
    fontSize: 13,
    lineHeight: 20,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    fontWeight: '500',
  },
  commentsText: {
    fontSize: 12,
    fontWeight: '500',
  },
})
