import { useCallback, useLayoutEffect } from 'react'
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useNavigation, useTheme } from '@react-navigation/native'
import { observer } from 'mobx-react-lite'
import { HeaderIconButton } from '../../../core/components/ui/buttons/HeaderIconButton'
import NewsVM, { NewsTab } from './News.vm'
import { useVM } from '../../../core/hooks/useVM'
import { Spacer } from '../../../core/components/ui/Spacer'
import { Container } from '../../../core/components/ui/Container'
import { SegmentedControl } from '../../../core/components/ui/segmentedControl/SegmentedControl'
import { PostListItem } from './components/postListItem/PostListItem'
import { NewsDetail } from './components/newsDetail/NewsDetail'
import { PhotoDetail } from '../collection/components/photoDetail/PhotoDetail'
import { ItemHistory } from '../collection/components/itemHistory/Item'
import type { NewsItems } from '../../../core/types/apiNews'
import type { CollectionItem } from '../../../core/services/photoPost'
import { t } from '../../../core/i18n'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { useTabletLayout } from '../../hooks/useTabletLayout'
import { usePanelHandoff } from '../../hooks/usePanelHandoff'
import { SCREENS } from '../../navigation/navigation.types'
import { PanelActions } from '../../components/PanelActions'

const Separator = () => <Spacer height={8} />
const ListHeader = () => <Spacer height={16} />
const ListFooter = () => <Spacer height={80} />

const postKeyExtractor = (item: NewsItems) => item._id
const photoKeyExtractor = (item: CollectionItem) => item.cid

export const NewsScreen = observer(() => {
  const vm = useVM(NewsVM)
  const { panel } = vm
  usePanelHandoff(SCREENS.NEWS, panel, vm.showPhoto)
  const { colors } = useTheme()
  const tabBarHeight = useBottomTabBarHeight()
  const navigation = useNavigation()
  const { listWidth, leftInset } = useTabletLayout()
  useLayoutEffect(() => {
    if (panel.cid && panel.postInfo) {
      // Taken now: the post is cleared when another photo is picked, and the header may draw meanwhile.
      const { cid, title, desc } = panel.postInfo
      const post = { cid, title, desc }
      navigation.setOptions({
        headerLeft: vm.selectedTab === 'posts'
          ? () => (
              <View style={s.headerLeft}>
                <HeaderIconButton name="arrow-back" color={colors.textFirst} onPress={panel.close} />
              </View>
            )
          : undefined,
        // The header stays while then-and-now covers the photo, so in compare mode the buttons that
        // belong to the post drop out. The row observes the panel itself; only another post has to
        // set it again.
        headerRight: () => <PanelActions panel={panel} post={post} sharedWithCompare style={s.header} />,
      })
    } else if (vm.selectedTab === 'posts' && vm.activePost) {
      navigation.setOptions({
        headerLeft: vm.canGoBack
          ? () => (
              <View style={s.headerLeft}>
                <HeaderIconButton name="arrow-back" color={colors.textFirst} onPress={vm.goBackToPost} />
              </View>
            )
          : undefined,
        headerRight: () => (
          <View style={s.header}>
            <HeaderIconButton name="share" color={colors.textFirst} onPress={vm.shareNews} />
          </View>
        ),
      })
    } else {
      navigation.setOptions({ headerLeft: undefined, headerRight: undefined })
    }
  }, [vm, panel, panel.cid, vm.selectedTab, vm.activePost, panel.postInfo, vm.canGoBack, colors.textFirst, navigation])

  const renderPost = useCallback(
    ({ item }: { item: NewsItems }) => (
      <PostListItem
        title={item.title}
        notice={item.notice}
        pdate={item.pdate}
        ccount={item.ccount}
        user={item.user}
        isSelected={vm.selectedPostId === item._id}
        onPress={() => vm.openPost(item)}
      />
    ),
    [vm],
  )

  const renderPhoto = useCallback(
    ({ item }: { item: CollectionItem }) => (
      <ItemHistory
        title={item.title}
        description={item.description}
        file={item.file}
        isSelected={vm.panel.cid === item.cid}
        onPress={() => vm.showPhoto(item.cid)}
      />
    ),
    [vm],
  )

  return (
    <Container row>
      {/* The pane beside it shows a photo (see PhotoDetail) or a news post out to the window's
          right edge. */}
      {/* Ends where the floating tab bar begins, so the rows scroll out of sight above it rather
          than showing around it. */}
      <View style={{ width: listWidth, marginLeft: leftInset, marginBottom: tabBarHeight }}>
        <Spacer height={18} />
        <View style={{ paddingHorizontal: 16 }}>
          <SegmentedControl
            options={vm.segmentOptions}
            selectedValue={vm.selectedTab}
            onChange={value => vm.setSelectedTab(value as NewsTab)}
          />
        </View>
        {vm.selectedTab === 'posts' ? (
          <FlatList<NewsItems>
            data={vm.news}
            style={s.list}
            contentContainerStyle={s.listContent}
            ListHeaderComponent={ListHeader}
            ListFooterComponent={ListFooter}
            ItemSeparatorComponent={Separator}
            keyExtractor={postKeyExtractor}
            renderItem={renderPost}
            initialNumToRender={10}
            maxToRenderPerBatch={5}
            windowSize={5}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              vm.loading ? (
                <View style={s.emptyContainer}>
                  <ActivityIndicator size="large" color="gray" />
                </View>
              ) : vm.newsError ? (
                <View style={s.emptyContainer}>
                  <Text style={{ color: colors.text, marginBottom: 12 }}>{t('news.postsError')}</Text>
                  <Text onPress={vm.retry} style={s.retryText}>{t('common.retry')}</Text>
                </View>
              ) : (
                <Text style={{ padding: 16, color: colors.text }}>{t('news.noPosts')}</Text>
              )
            }
          />
        ) : (
          <FlatList<CollectionItem>
            data={vm.historyItems}
            style={s.list}
            contentContainerStyle={s.listContent}
            ListHeaderComponent={ListHeader}
            ListFooterComponent={ListFooter}
            ItemSeparatorComponent={Separator}
            keyExtractor={photoKeyExtractor}
            renderItem={renderPhoto}
            initialNumToRender={10}
            maxToRenderPerBatch={5}
            windowSize={5}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              vm.photosLoading ? (
                <View style={s.emptyContainer}>
                  <ActivityIndicator size="large" color="gray" />
                </View>
              ) : vm.photosError ? (
                <View style={s.emptyContainer}>
                  <Text style={{ color: colors.text, marginBottom: 12 }}>{t('news.photosError')}</Text>
                  <Text onPress={vm.retry} style={s.retryText}>{t('common.retry')}</Text>
                </View>
              ) : (
                <Text style={{ padding: 16, color: colors.text }}>{t('news.noPhotos')}</Text>
              )
            }
          />
        )}
      </View>
      {panel.cid ? (
        <PhotoDetail
          panel={panel}
          onLinkPress={vm.openPhotoFromLink}
          onOpenPhoto={vm.showPhoto}
        />
      ) : (
        <NewsDetail
          post={vm.activePost}
          comments={vm.postComments}
          users={vm.postUsers}
          onLinkPress={vm.openPhotoFromLink}
        />
      )}
    </Container>
  )
})

const s = StyleSheet.create({
  // 44 pt buttons around 24 pt glyphs: 6 keeps the glyphs 16 from the edge.
  header: { flexDirection: 'row', marginRight: 6 },
  headerLeft: { marginLeft: 6 },
  // 16 in from each side, in line with the floating tab bar under the list.
  list: { flex: 1, paddingHorizontal: 16 },
  listContent: { paddingBottom: 16 },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  retryText: {
    color: '#428BF9',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
})
