import { FC } from 'react'
import { Image } from 'expo-image'
import { View, Text, Pressable, StyleProp, ViewStyle } from 'react-native'
import StandardAvatar from '../../../../../assets/avatar.png'
import { StackActions, useNavigation, useTheme } from '@react-navigation/native'
import RenderHTML from 'react-native-render-html'
import { s } from './style'
import { IComment, Users } from '../../../../../core/types/apiPhotoComment'
import { formatDate } from '../../../../../core/utils/getTime'
import { Spacer } from '../../../../../core/components/ui/Spacer'
import { StackParamList } from '../../../../navigation/stackParams.types'
import { SCREENS } from '../../../../navigation/navigation.types'

type CommentProps = {
  comment: IComment
  users: Users | null
  onLinkPress?: (href: string) => void
  /** Overrides the container, e.g. a narrower width for a reply-like comment. */
  style?: StyleProp<ViewStyle>
  /** Off where every comment is by the profile already on screen. */
  authorPressable?: boolean
}

export const Comment: FC<CommentProps> = ({
  users,
  comment,
  onLinkPress,
  style,
  authorPressable = true,
}) => {
  const { colors } = useTheme()
  const navigation = useNavigation()
  // Pushed, not navigated: from a profile's photo, a commenter opens a second profile on top.
  const openProfile = () => {
    const params: StackParamList[SCREENS.PROFILE] = { login: comment.user }
    navigation.dispatch(StackActions.push(SCREENS.PROFILE, params))
  }
  const commentHtml = { html: `<p>${comment.txt}</p>` }
  const date = formatDate(comment.stamp)
  const uri = users?.[comment.user]?.avatar
  return (
    <View style={[s.commentContainer, comment.parent ? s.width94 : s.width100, style]}>
      <Pressable
        onPress={openProfile}
        disabled={!authorPressable}
        hitSlop={4}
        accessibilityRole="link"
        accessibilityLabel={comment.user}>
        <Image
          source={uri ? { uri: `https://pastvu.com${uri}` } : StandardAvatar}
          style={s.image}
          cachePolicy="disk"
        />
      </Pressable>
      <Spacer width={8} />
      <View style={s.commentTextContainer}>
        <Text selectable style={s.row}>
          <Text
            style={[s.nameText, { color: colors.textFirst }]}
            onPress={authorPressable ? openProfile : undefined}>
            {comment.user}
          </Text>
          <Spacer width={5} />
          <Text style={[s.dateText, { color: colors.textThird }]}>{date}</Text>
        </Text>
        <RenderHTML
          source={commentHtml}
          baseStyle={{
            fontSize: 13,
            lineHeight: 20,
            color: colors.textSecond,
          }}
          tagsStyles={{
            a: {
              color: colors.primary,
              textDecorationLine: 'underline',
            },
          }}
          renderersProps={{
            a: {
              onPress: (_, href) => onLinkPress?.(href),
            },
          }}
        />
      </View>
    </View>
  )
}
