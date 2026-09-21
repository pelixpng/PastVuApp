import { useCallback, useLayoutEffect } from 'react'
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  useWindowDimensions,
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
import type { CollectionItem } from '../collection/Collection.screen'
import { t } from '../../../core/i18n'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'

const Separator = () => <Spacer height={8} />
const ListHeader = () => <Spacer height={16} />
const ListFooter = () => <Spacer height={80} />

const postKeyExtractor = (item: NewsItems) => item._id
const photoKeyExtractor = (item: CollectionItem) => item.cid

export const NewsScreen = observer(() => {
  const vm = useVM(NewsVM)
  const { colors } = useTheme()
  const tabBarHeight = useBottomTabBarHeight()
  const navigation = useNavigation()
  const { width } = useWindowDimensions()
  const listWidth = width * 0.33
  useLayoutEffect(() => {
    if (vm.selectedPhotoCid && vm.postInfo) {
      navigation.setOptions({
        headerLeft: vm.selectedTab === 'posts'
          ? () => (
              <View style={{ marginLeft: 6 }}>
                <HeaderIconButton name="arrow-back" color={colors.textFirst} onPress={vm.closePhoto} />
              </View>
            )
          : undefined,
        headerRight: () => (
          <View style={s.header}>
            <HeaderIconButton name="compare" color={colors.textFirst} onPress={vm.openCompare} />
            <Spacer width={4} />
            <HeaderIconButton name={vm.isFavorite ? 'favorite' : 'favorite-border'} color={colors.textFirst} onPress={vm.toggleFavorite} />
            <Spacer width={4} />
            <HeaderIconButton name="save-alt" color={colors.textFirst} onPress={vm.saveImage} />
            <Spacer width={4} />
            <HeaderIconButton name="share" color={colors.textFirst} onPress={vm.share} />
          </View>
        ),
      })
    } else if (vm.selectedTab === 'posts' && vm.activePost) {
      navigation.setOptions({
        headerLeft: vm.canGoBack
          ? () => (
              <View style={{ marginLeft: 6 }}>
                <HeaderIconButton name="arrow-back" color={colors.textFirst} onPress={vm.goBackToPost} />
              </View>
            )
          : undefined,
        headerRight: () => (
          <View style={s.header}>
            <HeaderIconButton name="share" color={colors.textFirst} />
          </View>
        ),
      })
    } else {
      navigation.setOptions({ headerLeft: undefined, headerRight: undefined })
    }
  }, [vm.selectedPhotoCid, vm.selectedTab, vm.activePost, vm.postInfo, vm.isFavorite, vm.canGoBack, colors.textFirst, navigation])

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
        isSelected={vm.selectedPhotoCid === item.cid}
        onPress={() => vm.showPhoto(item.cid)}
      />
    ),
    [vm],
  )

  return (
    <Container row>
      <View style={{ width: listWidth }}>
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
            data={vm.displayedPosts}
            style={s.postListContainer}
            // The tablet tab bar floats over the content, so the list needs to end above it.
            contentContainerStyle={{ paddingBottom: tabBarHeight + 16 }}
            ListHeaderComponent={ListHeader}
            ListFooterComponent={ListFooter}
            ItemSeparatorComponent={Separator}
            keyExtractor={postKeyExtractor}
            renderItem={renderPost}
            initialNumToRender={10}
            maxToRenderPerBatch={5}
            windowSize={5}
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
            data={vm.displayedPhotos}
            style={s.list}
            contentContainerStyle={{ paddingBottom: tabBarHeight + 16 }}
            ListHeaderComponent={ListHeader}
            ListFooterComponent={ListFooter}
            ItemSeparatorComponent={Separator}
            keyExtractor={photoKeyExtractor}
            renderItem={renderPhoto}
            initialNumToRender={10}
            maxToRenderPerBatch={5}
            windowSize={5}
            ListEmptyComponent={
              vm.loading ? (
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
      {vm.selectedPhotoCid ? (
        <PhotoDetail
          postInfo={vm.postInfo}
          comments={vm.photoComments}
          users={vm.photoUsers}
          onImageLoaded={vm.onImageLoad}
          imageLink={vm.imageLink}
          isImageLoaded={vm.isImageLoaded}
          showLoader={vm.showLoader}
          openFullScreen={vm.openFullScreenImage}
          onLinkPress={vm.openPhotoFromLink}
          compareMode={vm.compareMode}
          closeCompare={vm.closeCompare}
          hasStreetView={vm.hasStreetView}
          streetView={vm.streetView}
          comparePhoto={vm.comparePhoto}
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
  list: { flex: 1 },
  postListContainer: { flex: 1, paddingHorizontal: 16 },
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
