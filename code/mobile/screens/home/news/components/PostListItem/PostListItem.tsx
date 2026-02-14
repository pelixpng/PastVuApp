import { FC, memo } from 'react'
import { TouchableOpacity, View, Text } from 'react-native'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
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

const stripHtml = (html: string) =>
  html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[a-zA-Z]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

export const PostListItem: FC<PostListItemProps> = memo(
  ({ title, notice, pdate, ccount, user, onPress }) => {
    const { colors } = useTheme()
    const avatarUri = user.avatar ? `https://pastvu.com/_a/h/${user.avatar}` : null
    const formattedDate = formatDate(pdate)

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
                <Text
                  style={{
                    color: colors.textSecond,
                    fontWeight: '500',
                    fontSize: 13,
                    lineHeight: 20,
                  }}
                  numberOfLines={3}>
                  {stripHtml(notice)}
                </Text>
                <LinearGradient
                  colors={[colors.baseFifth + '99', colors.baseFifth]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 0.5, y: 0.5 }}
                  style={s.showMoreGradient}>
                  <Text
                    style={[
                      s.showMoreText,
                      {
                        color: colors.textSecond,
                        backgroundColor: colors.baseFifth,
                      },
                    ]}>
                    Показать ещё
                  </Text>
                </LinearGradient>
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
  },
)
