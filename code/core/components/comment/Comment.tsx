import { FC } from 'react'
import { Image } from 'expo-image'
import {
  View,
  Text,
  Pressable,
  StyleProp,
  ViewStyle,
  DimensionValue,
  StyleSheet,
} from 'react-native'
import { observer } from 'mobx-react-lite'
import { StackActions, useNavigation, useTheme } from '@react-navigation/native'
import RenderHTML from 'react-native-render-html'
import StandardAvatar from '../../../assets/avatar.png'
import { Spacer } from '../ui/Spacer'
import { IComment, Users } from '../../types/apiPhotoComment'
import { formatDate } from '../../utils/getTime'
import TranslationStore, { commentTranslationId } from '../../store/Translation.store'
import { TranslateToggle } from '../translate/TranslateToggle'

/** The profile screen's route: SCREENS.PROFILE in both the phone and the tablet stacks. */
const PROFILE_ROUTE = 'Profile'

type CommentProps = {
  comment: IComment
  users: Users | null
  onLinkPress?: (href: string) => void
  /**
   * A reply's width, kept to the right under the comment it answers: the wider the screen, the
   * less indent it needs. Without it a reply is as wide as any other comment.
   */
  replyWidth?: DimensionValue
  /** Overrides the container, e.g. a narrower width for a reply-like comment. */
  style?: StyleProp<ViewStyle>
  /** Off where every comment is by the profile already on screen. */
  authorPressable?: boolean
}

// An observer: the translation comes and goes without the list re-rendering.
export const Comment: FC<CommentProps> = observer(({
  users,
  comment,
  onLinkPress,
  replyWidth = '100%',
  style,
  authorPressable = true,
}) => {
  const { colors } = useTheme()
  const navigation = useNavigation()
  // Pushed, not navigated: from a profile's photo, a commenter opens a second profile on top.
  const openProfile = () => {
    navigation.dispatch(StackActions.push(PROFILE_ROUTE, { login: comment.user }))
  }
  const translationId = commentTranslationId(comment.cid)
  // Only while the translation is shown, and only into the app's current language.
  const translated = TranslationStore.translation(translationId)?.[0]
  const commentHtml = { html: `<p>${translated ?? comment.txt}</p>` }
  const date = formatDate(comment.stamp)
  const uri = users?.[comment.user]?.avatar
  return (
    <View style={[s.commentContainer, comment.parent ? { width: replyWidth } : s.width100, style]}>
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
              color: colors.basePrimary,
              textDecorationLine: 'underline',
            },
          }}
          renderersProps={{
            a: {
              onPress: (_, href) => onLinkPress?.(href),
            },
          }}
        />
        <TranslateToggle id={translationId} html={comment.txt} />
      </View>
    </View>
  )
})

const s = StyleSheet.create({
  commentContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    marginLeft: 'auto',
  },
  width100: { width: '100%' },
  image: {
    width: 40,
    height: 40,
    borderRadius: 200,
  },
  commentTextContainer: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
  nameText: {
    fontWeight: '800',
    fontSize: 13,
    lineHeight: 20,
  },
  dateText: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '500',
  },
})
