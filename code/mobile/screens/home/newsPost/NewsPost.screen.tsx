import { FlatList, StyleSheet, Text, View } from 'react-native'
import { observer } from 'mobx-react'
import { Image } from 'expo-image'
import { useNavigation, useTheme } from '@react-navigation/native'
import RenderHTML from 'react-native-render-html'
import { useCallback, useLayoutEffect } from 'react'
import { MaterialIcons } from '@expo/vector-icons'
import NewsPostVM from './NewsPost.vm'
import { Comment } from '../photoDetail/components/comment/Comment'
import { Container } from '../../../../core/components/ui/Container'
import { Spacer } from '../../../../core/components/ui/Spacer'
import { useVM } from '../../../../core/hooks/useVM'
import { IComment } from '../../../../core/types/apiPhotoComment'
import { formatDate } from '../../../../core/utils/getTime'
import StandardAvatar from '../../../../assets/avatar.png'

export const NewsPostScreen = observer(() => {
  const vm = useVM(NewsPostVM)
  const { colors } = useTheme()
  const navigation = useNavigation()

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <MaterialIcons
          name="share"
          size={24}
          color={colors.textFirst}
          onPress={vm.share}
          style={s.shareIcon}
        />
      ),
    })
  }, [colors.textFirst, navigation, vm.share])

  const renderItem = useCallback(
    ({ item }: { item: IComment }) => (
      <Comment comment={item} users={vm.users} onLinkPress={vm.openPhotoFromLink} />
    ),
    [vm.users, vm.openPhotoFromLink],
  )

  const avatarUri = vm.post?.user?.avatar ? `https://pastvu.com/_a/h/${vm.post.user.avatar}` : null
  const formattedDate = vm.post?.pdate ? formatDate(vm.post.pdate) : ''

  const ListHeader = () => (
    <View style={s.headerContainer}>
      <View style={s.userRow}>
        <Image
          source={avatarUri ? { uri: avatarUri } : StandardAvatar}
          style={s.avatar}
          cachePolicy="disk"
        />
        <Spacer width={8} />
        <Text style={[s.userName, { color: colors.textFirst }]}>
          {vm.post?.user?.disp || vm.post?.user?.login}
        </Text>
      </View>
      <Spacer height={12} />
      <Text style={[s.title, { color: colors.textFirst }]}>{vm.post?.title}</Text>
      <Spacer height={8} />
      <RenderHTML
        source={{ html: `<p>${vm.post?.txt || ''}</p>` }}
        baseStyle={{
          fontSize: 14,
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
          a: { onPress: (_, href) => vm.openPhotoFromLink(href) },
        }}
      />
      <Spacer height={12} />
      <Text style={[s.date, { color: colors.textThird }]}>{formattedDate}</Text>
      <Spacer height={16} />
      <View style={s.commentsHeader}>
        <Text style={[s.commentsTitle, { color: colors.textFirst }]}>Комментарии </Text>
        <Text style={[s.commentsCount, { color: colors.textThird }]}>{vm.post?.ccount || 0}</Text>
      </View>
      <Spacer height={12} />
    </View>
  )

  return (
    <Container>
      <FlatList
        data={vm.comments}
        renderItem={renderItem}
        keyExtractor={item => item.cid}
        ListHeaderComponent={ListHeader}
        ItemSeparatorComponent={() => <Spacer height={12} />}
        style={s.list}
        showsVerticalScrollIndicator={false}
      />
    </Container>
  )
})

const s = StyleSheet.create({
  list: {
    paddingHorizontal: 16,
  },
  shareIcon: {
    marginRight: 16,
  },
  headerContainer: {
    paddingTop: 16,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  date: {
    fontSize: 13,
  },
  commentsHeader: {
    flexDirection: 'row',
  },
  commentsTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  commentsCount: {
    fontSize: 16,
    fontWeight: '700',
  },
})
