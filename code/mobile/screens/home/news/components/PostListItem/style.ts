import { StyleSheet } from 'react-native'

export const s = StyleSheet.create({
  mainContainer: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  infoContainer: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  userNameText: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '600',
  },
  titleText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '700',
  },
  noticeText: {
    fontWeight: '400',
    fontSize: 14,
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
