import { useCallback, useLayoutEffect } from 'react'
import { FlatList, Pressable, StyleSheet, View } from 'react-native'
import { observer } from 'mobx-react-lite'
import { useNavigation, useTheme } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Container } from '../../../core/components/ui/Container'
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
import { t } from '../../../core/i18n'
import { PhotoListItem } from '../home/collection/components/Item'
import { Comment } from '../../../core/components/comment/Comment'
import ProfileVM from './Profile.vm'

const keyExtractor = (row: ProfileRow) => row.key
/** The content's top padding, where the list header starts. */
const CONTENT_TOP = 16

export const ProfileScreen = observer(() => {
  const vm = useVM(ProfileVM)
  const { bottom } = useSafeAreaInsets()
  const threadColor = useThreadColor()
  const navigation = useNavigation()
  const { colors } = useTheme()
  // Switching photos and comments must not throw a scrolled page back up to the header.
  const tabs = useTabsAnchor<ProfileRow>(CONTENT_TOP)

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={s.shareIcon}>
          <HeaderIconButton name="share" color={colors.textFirst} onPress={vm.shareProfile} />
        </View>
      ),
    })
  }, [colors.textFirst, navigation, vm.shareProfile])

  const renderItem = useCallback(
    ({ item, index }: { item: ProfileRow; index: number }) => {
      if (item.kind === 'comment') {
        return (
          // The whole comment opens what it was left on; links in the text open on their own.
          <Pressable
            onPress={() => vm.openRow(item)}
            style={({ pressed }) => pressed && s.pressed}>
            <ReplyThread last={item.lastInGroup} />
            <Comment
              comment={item.comment}
              users={vm.commentUsers}
              onLinkPress={vm.openLink}
              style={s.reply}
              authorPressable={false}
            />
          </Pressable>
        )
      }
      const commentsTab = vm.profileTab === 'comments'
      return (
        <View style={index > 0 && (commentsTab ? s.groupGap : s.photoGap)}>
          <PhotoListItem
            title={item.title}
            description={item.description}
            file={item.kind === 'photo' ? item.file : ''}
            icon={item.kind === 'news' ? 'article' : undefined}
            quietImageErrors
            onPress={() => vm.openRow(item)}
          />
          {/* The start of the line that leads down to the comments under it. */}
          {commentsTab && <View style={[s.stem, { backgroundColor: threadColor }]} />}
        </View>
      )
    },
    [vm, threadColor],
  )

  if (vm.profileState.status !== 'ready') {
    return (
      <Container>
        <ProfileStatus state={vm.profileState} onRetry={vm.loadProfile} />
      </Container>
    )
  }

  const photosTab = vm.profileTab === 'photos'

  return (
    <Container>
      <FlatList
        ref={tabs.listRef}
        onLayout={tabs.onListLayout}
        onScroll={tabs.onScroll}
        scrollEventThrottle={16}
        data={vm.activeRows}
        extraData={`${vm.profileTab}:${vm.commentTarget}`}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={
          <View>
            <ProfileSummary profile={vm.profileState.profile} />
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
            <Spacer height={16} />
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
        contentContainerStyle={[
          s.content,
          { paddingBottom: bottom + 16, minHeight: tabs.contentMinHeight },
        ]}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={7}
      />
    </Container>
  )
})

const s = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingTop: CONTENT_TOP },
  // 44 pt box around a 24 pt glyph: pull in by 10 so the glyph stays 16 from the edge.
  shareIcon: { marginRight: 6 },
  // The same spacing as between items in the collection.
  photoGap: { marginTop: 16 },
  // A comment already ends with 12 of margin; this makes 24 between one group and the next.
  groupGap: { marginTop: 12 },
  // From the bottom of the thumbnail to the first comment, centred under the thumbnail.
  stem: { marginLeft: THREAD_X - THREAD_WIDTH / 2, width: THREAD_WIDTH, height: 12 },
  pressed: { opacity: 0.6 },
  // Indented like a reply in a discussion, since each comment answers the row above it.
  reply: { width: '80%' },
})
