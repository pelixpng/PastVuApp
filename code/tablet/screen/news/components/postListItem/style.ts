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
    flexShrink: 1,
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
  // In a narrow column (an unfolded iPhone in portrait) the comment count goes under the date
  // rather than past the card's edge.
  footerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    columnGap: 8,
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
