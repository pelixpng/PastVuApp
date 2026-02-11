import { FC, useCallback } from 'react'
import { View, Text, FlatList, StyleSheet, useWindowDimensions } from 'react-native'
import { Image } from 'expo-image'
import { useTheme } from '@react-navigation/native'
import RenderHTML from 'react-native-render-html'
import { NewsItems } from '../../../../../core/types/apiNews'
import { IComment, Users } from '../../../../../core/types/apiPhotoComment'
import { Comment } from '../../../map/components/comment/Comment'
import { Spacer } from '../../../../../core/components/ui/Spacer'
import { formatDate } from '../../../../../core/utils/getTime'
import StandardAvatar from '../../../../../assets/avatar.png'

type NewsDetailProps = {
  post: NewsItems | null
  comments: IComment[]
  users: Users | null
  onLinkPress?: (href: string) => void
}

export const NewsDetail: FC<NewsDetailProps> = ({ post, comments, users, onLinkPress }) => {
  const { colors } = useTheme()
  const { width } = useWindowDimensions()
  const detailWidth = width * 0.67 - 32

  const renderItem = useCallback(
    ({ item }: { item: IComment }) => (
      <Comment comment={item} users={users} onLinkPress={onLinkPress} />
    ),
    [users, onLinkPress],
  )

  if (!post) {
    return (
      <View style={[s.container, { width: detailWidth }]}>
        <Spacer height={18} />
        <View style={s.emptyContainer}>
          <Text style={[s.emptyText, { color: colors.textThird }]}>
            Выберите новость для просмотра
          </Text>
        </View>
      </View>
    )
  }

  const avatarUri = post.user?.avatar ? `https://pastvu.com/_a/h/${post.user.avatar}` : null
  const formattedDate = post.pdate ? formatDate(post.pdate) : ''

  const ListHeader = () => (
    <View style={s.headerContainer}>
      <View style={s.userRow}>
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
      </View>
      <Spacer height={16} />
      <Text style={[s.title, { color: colors.textFirst }]}>{post.title}</Text>
      <Spacer height={16} />
      <RenderHTML
        source={{ html: `<p>${post.txt || ''}</p>` }}
        contentWidth={detailWidth - 32}
        domVisitors={{
          onElement: (el) => {
            if (el.tagName === 'img') {
              const src = el.attribs?.src
              if (!src || src === 'about:///blank' || src === 'about:blank') {
                el.tagName = 'span'
              }
            }
          },
        }}
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
          img: {
            maxWidth: detailWidth - 32,
          },
        }}
        renderersProps={{
          a: { onPress: (_, href) => onLinkPress?.(href) },
        }}
      />
      <Spacer height={24} />
      <View style={s.commentsHeader}>
        <Text style={[s.commentsTitle, { color: colors.textFirst }]}>Комментарии </Text>
        <Text style={[s.commentsCount, { color: colors.textThird }]}>{post.ccount || 0}</Text>
      </View>
      <Spacer height={12} />
    </View>
  )

  return (
    <View style={[s.container, { width: detailWidth }]}>
      <Spacer height={18} />
      <FlatList
        showsVerticalScrollIndicator={false}
        data={comments}
        renderItem={renderItem}
        keyExtractor={item => item.cid}
        ListHeaderComponent={ListHeader}
        ItemSeparatorComponent={() => <Spacer height={12} />}
        style={s.list}
      />
    </View>
  )
}

const s = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    paddingHorizontal: 16,
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