import { useCallback, useEffect, useLayoutEffect } from 'react'
import { FlatList, Pressable, StyleSheet, View } from 'react-native'
import { useNavigation, useRoute, useTheme } from '@react-navigation/native'
import { observer } from 'mobx-react-lite'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { HeaderIconButton } from '../../../core/components/ui/buttons/HeaderIconButton'
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
import { useHeaderEdgeStyles } from '../../../core/hooks/useHeaderEdgeStyles'
import { t } from '../../../core/i18n'
import { refreshWindowRegion } from '../../../modules/window-region'
import { useTabletLayout } from '../../hooks/useTabletLayout'
import { useTabletHeader } from '../../hooks/useTabletHeader'
import { PanelActions } from '../../components/PanelActions'
import { ItemHistory } from '../collection/components/itemHistory/Item'
import { Comment } from '../../../core/components/comment/Comment'
import { PhotoDetail } from '../collection/components/photoDetail/PhotoDetail'
import { NewsDetail } from '../news/components/newsDetail/NewsDetail'
import ProfileVM from './Profile.vm'
import { UiHandoff, profilePanelKey } from '../../../core/store/UiHandoff'

const keyExtractor = (row: ProfileRow) => row.key
/** The list content's top padding, where the list header starts. */
const CONTENT_TOP = 16

/**
 * Laid out like the collection: the profile and its lists on the left, as wide as the tablet's
 * list column (see useTabletLayout), and beside them the selected photo, or the news post a
 * comment was left on. The screen fades in over the tabs without moving, so on Android the window
 * learns what it covers as soon as it is laid out (see modules/window-region) and the map
 * underneath cannot show through while the transition runs.
 */
export const ProfileScreen = observer(() => {
  const navigation = useNavigation()
  const { listWidth, leftInset, tier } = useTabletLayout()
  // A centred title leaves the photo's buttons on the right as little room as the back arrow has
  // on the left: below a `regular` window seven or eight of them run over the title. There the
  // title goes on the left, after the back arrow, and the buttons get the rest of the row.
  const centredTitle = tier === 'regular'
  const { headerTitleContainerStyle: titleEdge, headerRightContainerStyle: rightEdge } =
    useHeaderEdgeStyles('left')
  const header = useTabletHeader()
  const { bottom } = useSafeAreaInsets()
  const { colors } = useTheme()
  const vm = useVM(ProfileVM)
  const { panel } = vm
  // Carries the photo in the pane across a switch to and from the phone interface (see
  // core/store/UiHandoff): opens the one the phone had open from this profile, and tells what the
  // pane shows. The login comes from the route, which the view model reads a moment later.
  const route = useRoute()
  useEffect(() => {
    const { login } = route.params as { login: string }
    const photo = UiHandoff.takeProfilePhoto(login)
    if (photo) vm.openPhoto(photo.cid)
    return UiHandoff.registerPanel(profilePanelKey(route.key), () =>
      panel.cid ? { cid: panel.cid, title: panel.postInfo?.title ?? '' } : null,
    )
  }, [route, vm, panel])
  const threadColor = useThreadColor()
  // Switching photos and comments must not throw a scrolled list back up to the header.
  const tabs = useTabsAnchor<ProfileRow>(CONTENT_TOP)

  useLayoutEffect(() => {
    // Captured so the header closure keeps the post TypeScript has narrowed to non-null.
    const post = panel.postInfo
    navigation.setOptions({
      // The stack's own header style with the height added: options replace it as a whole.
      headerStyle: { backgroundColor: colors.backgroundApp, elevation: 0, ...header.style },
      headerStatusBarHeight: header.statusBarHeight,
      headerRightContainerStyle: [rightEdge, header.rightContainer],
      headerTitleAlign: centredTitle ? 'center' : 'left',
      headerTitleContainerStyle: centredTitle ? undefined : [s.leftTitle, titleEdge],
      // The header stays while then-and-now covers the post, so in compare mode the buttons that
      // belong to the post drop out. The row observes the panel itself; only another post, a
      // news post or an empty pane has to set the header again.
      headerRight: post
        ? () => (
            <PanelActions
              panel={panel}
              post={post}
              sharedWithCompare
              onToggleFavorite={vm.toggleFavorite}
              style={s.header}
            />
          )
        : vm.showsNews
          ? () => (
              <View style={s.header}>
                <HeaderIconButton name="share" color={colors.textFirst} onPress={vm.shareNews} />
              </View>
            )
          : undefined,
    })
  }, [
    panel.postInfo,
    vm.showsNews,
    colors.textFirst,
    colors.backgroundApp,
    navigation,
    vm,
    panel,
    centredTitle,
    titleEdge,
    rightEdge,
    header,
  ])

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
          ? vm.panel.cid === item.cid
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
      {/* Beside it, the photo's pane takes its width from the window (see PhotoDetail) and a
          news post reaches the window's right edge. */}
      <View style={{ width: listWidth, marginLeft: leftInset }}>
        {vm.profileState.status !== 'ready' ? (
          <ProfileStatus state={vm.profileState} onRetry={vm.loadProfile} />
        ) : (
          <FlatList
            ref={tabs.listRef}
            style={s.list}
            onLayout={tabs.onListLayout}
            onScroll={tabs.onScroll}
            scrollEventThrottle={16}
            data={vm.activeRows}
            // Rows read the selection inside renderItem, which the list does not track.
            extraData={`${vm.profileTab}:${vm.commentTarget}:${panel.cid}:${vm.selectedNewsCid}`}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            ListHeaderComponent={
              <View>
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
        <PhotoDetail panel={panel} onLinkPress={vm.openPanelLink} onOpenPhoto={vm.openPhoto} />
      )}
    </View>
  )
})

const s = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row' },
  // The header and the rows' highlight 16 in from each side, the rows' content another 16, as on
  // the collection and news screens.
  list: { paddingHorizontal: 16 },
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
  // 16 pt from the back arrow, as the tabs' titles keep from theirs (see BottomTabsNavigator):
  // next to a left button react-navigation cuts the gap to 4.
  leftTitle: { marginStart: 16 },
})
