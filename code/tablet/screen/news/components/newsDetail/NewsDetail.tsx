import { FC, memo, useCallback, useMemo } from 'react'
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native'
import { Image } from 'expo-image'
import { StackActions, useNavigation, useTheme } from '@react-navigation/native'
import RenderHTML, {
  DomVisitorCallbacks,
  MixedStyleDeclaration,
  MixedStyleRecord,
  RenderHTMLProps,
} from 'react-native-render-html'
import { NewsItems } from '../../../../../core/types/apiNews'
import { IComment, Users } from '../../../../../core/types/apiPhotoComment'
import { Comment } from '../../../../../core/components/comment/Comment'
import { Spacer } from '../../../../../core/components/ui/Spacer'
import { formatDate } from '../../../../../core/utils/getTime'
import StandardAvatar from '../../../../../assets/avatar.png'
import { t } from '../../../../../core/i18n'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StackParamList } from '../../../../navigation/stackParams.types'
import { SCREENS } from '../../../../navigation/navigation.types'
import { useTabletLayout } from '../../../../hooks/useTabletLayout'
// The same padding as a photo's pane in this place, so the two line up as the pane switches.
import { PANE_PADDING } from '../../../collection/components/photoDetail/style'

const Separator = () => <Spacer height={12} />
const keyExtractor = (item: IComment) => item.cid

// At module level, and the styles in PostHeader memoised: RenderHTML builds its render engine
// again whenever one of them changes identity.
const domVisitors: DomVisitorCallbacks = {
  onElement: el => {
    // An image with no address, or a blank one, becomes a span rather than an empty image box.
    if (el.tagName === 'img') {
      const src = el.attribs?.src
      if (!src || src === 'about:///blank' || src === 'about:blank') {
        el.tagName = 'span'
      }
    }
  },
}

type PostHeaderProps = {
  post: NewsItems
  /** The widest the post's images may be: at most the text column inside the pane's padding. */
  contentWidth: number
  onLinkPress?: (href: string) => void
}

/**
 * The post above its comments: author, date, title, text and the comment count. Its own component,
 * handed to the list as an element, so the list updates it in place: an inline component would be
 * a new type on every render, and the list would mount it again and parse the post's HTML anew,
 * as on each step of a turn or a window resize.
 */
const PostHeader = memo(function PostHeader({
  post,
  contentWidth,
  onLinkPress,
}: PostHeaderProps) {
  const { colors } = useTheme()
  const navigation = useNavigation()
  const source = useMemo(() => ({ html: `<p>${post.txt || ''}</p>` }), [post.txt])
  const baseStyle = useMemo<MixedStyleDeclaration>(
    () => ({ fontSize: 13, lineHeight: 20, color: colors.textSecond }),
    [colors.textSecond],
  )
  // No maxWidth for img: RenderHTML already fits every image to contentWidth, and leaving the
  // width out keeps the render engine from being rebuilt when the pane changes width.
  const tagsStyles = useMemo<MixedStyleRecord>(
    () => ({ a: { color: colors.basePrimary, textDecorationLine: 'underline' } }),
    [colors.basePrimary],
  )
  const renderersProps = useMemo<RenderHTMLProps['renderersProps']>(
    () => ({ a: { onPress: (_, href) => onLinkPress?.(href) } }),
    [onLinkPress],
  )
  const avatarUri = post.user?.avatar ? `https://pastvu.com/_a/h/${post.user.avatar}` : null
  const formattedDate = post.pdate ? formatDate(post.pdate) : ''
  return (
    <View style={s.headerContainer}>
      <Pressable
        style={s.userRow}
        disabled={!post.user?.login}
        onPress={() => {
          if (!post.user?.login) return
          const params: StackParamList[SCREENS.PROFILE] = { login: post.user.login }
          navigation.dispatch(StackActions.push(SCREENS.PROFILE, params))
        }}
        accessibilityRole="link">
        <Image
          source={avatarUri ? { uri: avatarUri } : StandardAvatar}
          style={s.avatar}
          cachePolicy="disk"
        />
        <Spacer width={8} />
        <View>
          <Text style={[s.userName, { color: colors.textFirst }]}>
            {post.user?.disp || post.user?.login}
          </Text>
          <Text style={[s.date, { color: colors.textThird }]}>{formattedDate}</Text>
        </View>
      </Pressable>
      <Spacer height={16} />
      <Text style={[s.title, { color: colors.textFirst }]}>{post.title}</Text>
      <Spacer height={16} />
      <RenderHTML
        source={source}
        contentWidth={contentWidth}
        domVisitors={domVisitors}
        baseStyle={baseStyle}
        tagsStyles={tagsStyles}
        renderersProps={renderersProps}
      />
      <Spacer height={24} />
      <View style={s.commentsHeader}>
        <Text style={[s.commentsTitle, { color: colors.textFirst }]}>{t('photo.comments')} </Text>
        <Text style={[s.commentsCount, { color: colors.textThird }]}>{post.ccount || 0}</Text>
      </View>
      <Spacer height={12} />
    </View>
  )
})

type NewsDetailProps = {
  post: NewsItems | null
  comments: IComment[]
  users: Users | null
  onLinkPress?: (href: string) => void
}

/**
 * The news post's pane beside a list `listWidth` wide (see useTabletLayout), on the news and
 * profile screens: it fills the row out to the window's right edge.
 */
export const NewsDetail: FC<NewsDetailProps> = ({ post, comments, users, onLinkPress }) => {
  const { colors } = useTheme()
  const { bottom } = useSafeAreaInsets()
  // The pane is what the list leaves of the window, as wide as a photo's (see PhotoDetail): the
  // post's images are fitted to the text column inside its padding.
  const layout = useTabletLayout()
  const contentWidth = layout.panelWidth - 2 * PANE_PADDING

  const renderItem = useCallback(
    ({ item }: { item: IComment }) => (
      <Comment comment={item} users={users} onLinkPress={onLinkPress} replyWidth="94%" />
    ),
    [users, onLinkPress],
  )

  if (!post) {
    return (
      <View style={s.container}>
        <Spacer height={18} />
        <View style={s.emptyContainer}>
          <Text style={[s.emptyText, { color: colors.textThird }]}>
            {t('news.selectPost')}
          </Text>
        </View>
      </View>
    )
  }

  return (
    <View style={s.container}>
      <Spacer height={18} />
      <FlatList
        contentContainerStyle={{ paddingBottom: bottom + 16 }}
        showsVerticalScrollIndicator={false}
        data={comments}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={
          <PostHeader post={post} contentWidth={contentWidth} onLinkPress={onLinkPress} />
        }
        ItemSeparatorComponent={Separator}
        style={s.list}
      />
    </View>
  )
}

const s = StyleSheet.create({
  // The rest of the row beside the list, out to the window's right edge.
  container: {
    flex: 1,
  },
  list: {
    paddingHorizontal: PANE_PADDING,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '500',
  },
  headerContainer: {
    paddingTop: 4,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 99,
  },
  userName: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '800',
  },
  date: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '500',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 24,
  },
  commentsHeader: {
    flexDirection: 'row',
  },
  commentsTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  commentsCount: {
    fontSize: 17,
    fontWeight: '800',
  },
})
