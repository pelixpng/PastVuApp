import { FlatList, StyleSheet, Text, View } from 'react-native'
import { observer } from 'mobx-react'
import { Image } from 'expo-image'
import { useNavigation, useTheme } from '@react-navigation/native'
import RenderHTML from 'react-native-render-html'
import { useCallback, useLayoutEffect } from 'react'
import { MaterialIcons } from '@expo/vector-icons'
import { HeaderIconButton } from '../../../../core/components/ui/buttons/HeaderIconButton'
import NewsPostVM from './NewsPost.vm'
import { Comment } from '../photoDetail/components/comment/Comment'
import { Container } from '../../../../core/components/ui/Container'
import { Spacer } from '../../../../core/components/ui/Spacer'
import { useVM } from '../../../../core/hooks/useVM'
import { IComment } from '../../../../core/types/apiPhotoComment'
import { formatDate } from '../../../../core/utils/getTime'
import StandardAvatar from '../../../../assets/avatar.png'
import { t } from '../../../../core/i18n'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export const NewsPostScreen = observer(() => {
  const vm = useVM(NewsPostVM)
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()
  const navigation = useNavigation()

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={s.shareIcon}>
          <HeaderIconButton name="share" color={colors.textFirst} onPress={vm.share} />
        </View>
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
        <View>
          <Text style={[s.userName, { color: colors.textFirst }]}>
            {vm.post?.user?.disp || vm.post?.user?.login}
          </Text>
          <Text style={[s.date, { color: colors.textThird }]}>{formattedDate}</Text>
        </View>
      </View>
      <Spacer height={12} />
      <Text style={[s.title, { color: colors.textFirst }]}>{vm.post?.title}</Text>
      <Spacer height={12} />
      <RenderHTML
        source={{ html: `<p>${vm.post?.txt || ''}</p>` }}
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
          a: { onPress: (_, href) => vm.openPhotoFromLink(href) },
        }}
      />
      <Spacer height={24} />
      <View style={s.commentsHeader}>
        <Text style={[s.commentsTitle, { color: colors.textFirst }]}>{t('photo.comments')} </Text>
        <Text style={[s.commentsCount, { color: colors.textThird }]}>{vm.post?.ccount || 0}</Text>
      </View>
      <Spacer height={12} />
    </View>
  )

  return (
    <Container>
      <FlatList
        // The screen runs edge to edge, so the last comments ended up under the system navigation
        // buttons with no way to scroll past them.
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
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
  // 44 pt box around a 24 pt glyph: pull in by 10 so the glyph stays 16 from the edge.
  shareIcon: {
    marginRight: 6,
  },
  headerContainer: {
    paddingTop: 18,
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
  title: {
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 24,
  },
  date: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '500',
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
