import { FC, memo, useState, useEffect } from 'react'
import { TouchableOpacity, View, Text } from 'react-native'
import { Image } from 'expo-image'
import RenderHTML from 'react-native-render-html'
import { s } from './style'
import { useTheme } from '@react-navigation/native'
import { Spacer } from '../../../../../../core/components/ui/Spacer'
import StandardAvatar from '../../../../../../assets/avatar.png'
import { NewsUser } from '../../../../../../core/types/apiNews'
import { formatDate } from '../../../../../../core/utils/getTime'

export type PostListItemProps = {
  onPress: () => void
  title: string
  notice: string
  pdate: string
  ccount: number
  user: NewsUser
}

const stripHtml = (html: string) => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()

export const PostListItem: FC<PostListItemProps> = memo(({
  title,
  notice,
  pdate,
  ccount,
  user,
  onPress,
}) => {
  const { colors } = useTheme()
  const avatarUri = user.avatar ? `https://pastvu.com/_a/h/${user.avatar}` : null
  const formattedDate = formatDate(pdate)
  const [htmlReady, setHtmlReady] = useState(false)

  useEffect(() => {
    if (notice) {
      const frame = requestAnimationFrame(() => setHtmlReady(true))
      return () => cancelAnimationFrame(frame)
    }
  }, [notice])

  return (
    <TouchableOpacity
      style={[s.mainContainer, { backgroundColor: colors.baseFifth }]}
      onPress={onPress}>
      <View style={s.infoContainer}>
        <View style={s.headerContainer}>
          <Image
            source={avatarUri ? { uri: avatarUri } : StandardAvatar}
            style={s.avatar}
            cachePolicy="disk"
          />
          <Spacer width={8} />
          <Text style={[s.userNameText, { color: colors.textFirst }]}>
            {user.disp || user.login}
          </Text>
        </View>
        <Spacer height={8} />
        <Text numberOfLines={1} style={[s.titleText, { color: colors.textFirst }]}>
          {title}
        </Text>
        {notice ? (
          <>
            <Spacer height={8} />
            <View style={s.noticeContainer}>
              {htmlReady ? (
                <RenderHTML
                  source={{ html: notice }}
                  baseStyle={{
                    color: colors.textSecond,
                    fontWeight: '500',
                    fontSize: 13,
                    lineHeight: 20,
                  }}
                  tagsStyles={{
                    p: { margin: 0, padding: 0 },
                    body: { margin: 0, padding: 0 },
                  }}
                />
              ) : (
                <Text
                  style={{
                    color: colors.textSecond,
                    fontWeight: '500',
                    fontSize: 13,
                    lineHeight: 20,
                  }}
                  numberOfLines={4}>
                  {stripHtml(notice)}
                </Text>
              )}
              <Text
                style={[
                  s.showMoreText,
                  {
                    color: colors.textSecond,
                    backgroundColor: colors.baseFifth,
                    shadowColor: colors.baseFifth,
                  },
                ]}>
                Показать ещё
              </Text>
            </View>
          </>
        ) : null}
        <Spacer height={8} />
        <View style={s.footerContainer}>
          <Text style={[s.dateText, { color: colors.textThird }]}>{formattedDate}</Text>
          {ccount > 0 && (
            <Text style={[s.commentsText, { color: colors.textThird }]}>
              {ccount} {ccount === 1 ? 'комментарий' : 'комментариев'}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  )
})
