import { useCallback, useLayoutEffect } from 'react'
import { FlatList, Pressable, StyleSheet, View } from 'react-native'
import { useNavigation, useTheme } from '@react-navigation/native'
import { observer } from 'mobx-react-lite'
import { useSafeAreaFrame, useSafeAreaInsets } from 'react-native-safe-area-context'
import { HeaderIconButton } from '../../../core/components/ui/buttons/HeaderIconButton'
import { ColorizeButtons } from '../../../core/components/colorize/ColorizeButtons'
import { Spacer } from '../../../core/components/ui/Spacer'
import { SegmentedControl } from '../../../core/components/ui/segmentedControl/SegmentedControl'
import { FilterChips } from '../../../core/components/ui/FilterChips'
import {
  ProfileListFooter,
  ProfileStatus,
  ProfileSummary,
} from '../../../core/components/profile/ProfileView'
import { CommentTarget, ProfileRow, ProfileTab } from '../../../core/services/userProfile'
import {
  ReplyThread,
  THREAD_WIDTH,
  THREAD_X,
  useThreadColor,
} from '../../../core/components/profile/ReplyThread'
import { useVM } from '../../../core/hooks/useVM'
import { useTabsAnchor } from '../../../core/hooks/useTabsAnchor'
import { t } from '../../../core/i18n'
import { refreshWindowRegion } from '../../../modules/window-region'
import { ItemHistory } from '../collection/components/itemHistory/Item'
import { Comment } from '../map/components/comment/Comment'
import { PhotoDetail } from '../collection/components/photoDetail/PhotoDetail'
import { NewsDetail } from '../news/components/newsDetail/NewsDetail'
import ProfileVM from './Profile.vm'

const keyExtractor = (row: ProfileRow) => row.key
/** The list content's top padding, where the list header starts. */
const CONTENT_TOP = 16

/**
 * Laid out like the collection: the profile and its lists on the left, the selected photo, or
 * the news post a comment was left on, on the right. The screen fades in over the tabs without
 * moving, so on Android the window learns what it covers as soon as it is laid out (see
 * modules/window-region) and the map underneath cannot show through while the transition runs.
 */
export const ProfileScreen = observer(() => {
  const navigation = useNavigation()
  // The root view's width, not Dimensions: see core/hooks/useRootSize.
  const { width } = useSafeAreaFrame()
  const { bottom } = useSafeAreaInsets()
  const { colors } = useTheme()
  const vm = useVM(ProfileVM)
  const threadColor = useThreadColor()
  // Switching photos and comments must not throw a scrolled list back up to the header.
  const tabs = useTabsAnchor<ProfileRow>(CONTENT_TOP)

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: vm.postInfo
        ? () => (
            <View style={s.header}>
              {/* Palette and the comparison with the original; the latter not over the then-and-now view. */}
              <ColorizeButtons colorize={vm.colorize} showCompareOriginal={!vm.compareMode} />
              <HeaderIconButton name="compare" color={colors.textFirst} onPress={vm.openCompare} />
              <Spacer width={4} />
              <HeaderIconButton
                name={vm.isFavorite ? 'favorite' : 'favorite-border'}
                color={colors.textFirst}
                onPress={vm.toggleFavorite}
              />
              <Spacer width={4} />
              <HeaderIconButton name="save-alt" color={colors.textFirst} onPress={vm.saveImage} />
              <Spacer width={4} />
              <HeaderIconButton name="share" color={colors.textFirst} onPress={vm.share} />
            </View>
          )
        : vm.showsNews
          ? () => (
              <View style={s.header}>
                <HeaderIconButton name="share" color={colors.textFirst} onPress={vm.shareNews} />
              </View>
            )
          : undefined,
    })
  }, [vm.postInfo, vm.showsNews, vm.isFavorite, vm.compareMode, colors.textFirst, navigation, vm])

  const renderItem = useCallback(
    ({ item }: { item: ProfileRow }) => {
      if (item.kind === 'comment') {
        return (
          // The whole comment opens what it was left on; links in the text open on their own.
          <Pressable
            onPress={() => vm.openRow(item)}
            style={({ pressed }) => [s.replyRow, pressed && s.pressed]}>
            <ReplyThread last={item.lastInGroup} />
            <Comment
              comment={item.comment}
              users={vm.commentUsers}
              onLinkPress={vm.openPanelLink}
              style={s.reply}
              authorPressable={false}
            />
          </Pressable>
        )
      }
      const selected =
        item.kind === 'photo'
          ? vm.selectedItem === item.cid
          : vm.showsNews && vm.selectedNewsCid === item.cid
      return (
        <View>
          <ItemHistory
            title={item.title}
            description={item.description}
            file={item.kind === 'photo' ? item.file : ''}
            icon={item.kind === 'news' ? 'article' : undefined}
            isSelected={selected}
            onPress={() => vm.openRow(item)}
          />
          {/* The start of the line that leads down to the comments under it. */}
          {vm.profileTab === 'comments' && (
            <View style={[s.stem, { backgroundColor: threadColor }]} />
          )}
        </View>
      )
    },
    [vm, threadColor],
  )

  const photosTab = vm.profileTab === 'photos'

  return (
    <View
      style={[s.container, { backgroundColor: colors.backgroundApp }]}
      onLayout={refreshWindowRegion}>
      <View style={{ width: width * 0.33 }}>
        {vm.profileState.status !== 'ready' ? (
          <ProfileStatus state={vm.profileState} onRetry={vm.loadProfile} />
        ) : (
          <FlatList
            ref={tabs.listRef}
            onLayout={tabs.onListLayout}
            onScroll={tabs.onScroll}
            scrollEventThrottle={16}
            data={vm.activeRows}
            // Rows read the selection inside renderItem, which the list does not track.
            extraData={`${vm.profileTab}:${vm.commentTarget}:${vm.selectedItem}:${vm.selectedNewsCid}`}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            ListHeaderComponent={
              <View style={s.listHeader}>
                <ProfileSummary profile={vm.profileState.profile} onShare={vm.shareProfile} />
                <Spacer height={24} />
                <View onLayout={tabs.onTabsLayout}>
                  <SegmentedControl
                    options={vm.profileTabs}
                    selectedValue={vm.profileTab}
                    onChange={value => {
                      tabs.keepTabsInPlace()
                      vm.setProfileTab(value as ProfileTab)
                    }}
                  />
                </View>
                {!photosTab && (
                  <>
                    <Spacer height={12} />
                    <FilterChips
                      options={vm.commentFilters}
                      selectedValue={vm.commentTarget}
                      onChange={value => {
                        tabs.keepTabsInPlace()
                        vm.setCommentTarget(value as CommentTarget)
                      }}
                    />
                  </>
                )}
                <Spacer height={8} />
              </View>
            }
            ListFooterComponent={
              <ProfileListFooter
                list={vm.activeList}
                emptyText={photosTab ? t('news.noPhotos') : t('profile.noComments')}
                errorText={photosTab ? t('news.photosError') : t('profile.commentsError')}
              />
            }
            onEndReached={vm.activeList.loadMore}
            onEndReachedThreshold={0.5}
            contentContainerStyle={{
              paddingTop: CONTENT_TOP,
              paddingBottom: bottom + 16,
              minHeight: tabs.contentMinHeight,
            }}
            showsVerticalScrollIndicator={false}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={7}
          />
        )}
      </View>
      {vm.showsNews ? (
        <NewsDetail
          post={vm.selectedNews}
          comments={vm.newsPostComments}
          users={vm.newsPostUsers}
          onLinkPress={vm.openPanelLink}
        />
      ) : (
        <PhotoDetail
          postInfo={vm.postInfo}
          users={vm.users}
          comments={vm.comments}
          onImageLoaded={vm.onImageLoad}
          imageLink={vm.imageLink}
          isImageLoaded={vm.isImageLoaded}
          showLoader={vm.showLoader}
          photoSelected={vm.selectedItem !== null}
          openFullScreen={vm.openFullScreenImage}
          colorize={vm.colorize}
          onLinkPress={vm.openPanelLink}
          onOpenPhoto={vm.openPhoto}
          compareMode={vm.compareMode}
          closeCompare={vm.closeCompare}
          hasStreetView={vm.hasStreetView}
          streetView={vm.streetView}
          comparePhoto={vm.comparePhoto}
        />
      )}
    </View>
  )
})

const s = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row' },
  // Rows carry their own 16 pt padding, like in the collection; the header needs it added.
  listHeader: { paddingHorizontal: 16 },
  // A margin, not padding: the thread line inside is positioned from the row's own edge.
  replyRow: { marginHorizontal: 16 },
  // From the bottom of the thumbnail (8 of row padding plus 80) down to the first comment.
  stem: {
    position: 'absolute',
    left: 16 + THREAD_X - THREAD_WIDTH / 2,
    top: 88,
    bottom: 0,
    width: THREAD_WIDTH,
  },
  pressed: { opacity: 0.6 },
  // Indented like a reply in a discussion, since each comment answers the row above it.
  reply: { width: '80%' },
  // 44 pt buttons around 24 pt glyphs: 6 keeps the glyphs 16 from the edge.
  header: { flexDirection: 'row', marginRight: 6 },
})
