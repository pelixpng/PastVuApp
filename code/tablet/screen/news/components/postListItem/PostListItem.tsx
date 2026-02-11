import { FC, useMemo } from 'react'
import { Pressable, View, Text, useWindowDimensions } from 'react-native'
import { Image } from 'expo-image'
import RenderHTML from 'react-native-render-html'
import { useTheme } from '@react-navigation/native'
import { s } from './style'
import { Spacer } from '../../../../../core/components/ui/Spacer'
import { NewsUser } from '../../../../../core/types/apiNews'
import { formatDate } from '../../../../../core/utils/getTime'
import StandardAvatar from '../../../../../assets/avatar.png'

export type PostListItemProps = {
  onPress: () => void
  title: string
  notice: string
  pdate: string
  ccount: number
  user: NewsUser
  isSelected?: boolean
}

export const PostListItem: FC<PostListItemProps> = ({
  title,
  notice,
  pdate,
  ccount,
  user,
  onPress,
  isSelected,
}) => {
  const { colors } = useTheme()
  const { width } = useWindowDimensions()
  const contentWidth = width * 0.33 - 32
  const avatarUri = user.avatar ? `https://pastvu.com/_a/h/${user.avatar}` : null
  const formattedDate = formatDate(pdate)
  const backgroundColor = useMemo(
    () => (isSelected ? colors.baseThird : null),
    [isSelected, colors],
  )

  return (
    <Pressable
      style={[s.mainContainer, { backgroundColor }]}
      onPress={onPress}>
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
          <Spacer height={4} />
          <View style={s.noticeContainer} pointerEvents="none">
            <RenderHTML
              source={{ html: notice }}
              contentWidth={contentWidth}
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
            <Text
              style={[
                s.showMoreText,
                {
                  color: colors.textSecond,
                  backgroundColor: isSelected ? colors.baseThird : colors.backgroundApp,
                  shadowColor: isSelected ? colors.baseThird : colors.backgroundApp,
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
    </Pressable>
  )
}