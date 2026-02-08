import { FC } from 'react'
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

export const PostListItem: FC<PostListItemProps> = ({
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
        <Spacer height={8} />
        <View style={s.noticeContainer}>
          <RenderHTML
            source={{ html: notice }}
            baseStyle={{
              color: colors.textSecond,
              fontWeight: '500',
              fontSize: 13,
              lineHeight: 20,
            }}
          />
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
}
