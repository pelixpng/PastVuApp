import { FC, useCallback } from 'react'
import {
  ActivityIndicator,
  BackHandler,
  View,
  Text,
  FlatList,
  StyleSheet,
} from 'react-native'
import Animated, { Easing, FadeIn } from 'react-native-reanimated'
import { useFocusEffect, useTheme } from '@react-navigation/native'
import { observer } from 'mobx-react-lite'
import { IComment } from '../../../../../core/types/apiPhotoComment'
import { PANE_PADDING, s } from './style'
import { PostInfo } from '../../../map/components/postInfo/PostInfo'
import { Comment } from '../../../../../core/components/comment/Comment'
import { Spacer } from '../../../../../core/components/ui/Spacer'
import { t } from '../../../../../core/i18n'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { CompareView } from '../../../../../core/components/compare/CompareView'
import { streetViewTarget } from '../../../../../core/services/streetView'
import { PhotoPanel } from '../../../../../core/store/PhotoPanel'
import { useTabletLayout } from '../../../../hooks/useTabletLayout'

// As on the phone: the next photo's post fades in rather than snapping into place, and the spinner
// comes late, so a post that is already cached does not flash it.
const postEntering = FadeIn.duration(220).easing(Easing.out(Easing.cubic))
const loaderEntering = FadeIn.delay(150).duration(200)

type PhotoDetailProps = {
  panel: PhotoPanel
  onLinkPress?: (href: string) => void
  /** Opens another photo in this panel, here from the nearby photos. */
  onOpenPhoto?: (cid: string) => void
}

/**
 * The photo's pane beside a list `listWidth` wide (see useTabletLayout), on the collection, news
 * and profile screens, out to the window's right edge: as wide as the map's photo panel, so a post
 * is laid out the same on every screen.
 * An observer: the post and its colour state come from the panel, not from the props.
 */
export const PhotoDetail: FC<PhotoDetailProps> = observer(({
  panel,
  onLinkPress,
  onOpenPhoto,
}) => {
  const { postInfo, comments, users, colorize, compareMode, comparePhoto, streetView } = panel
  const { colors } = useTheme()
  const { bottom } = useSafeAreaInsets()
  const layout = useTabletLayout()
  const paneWidth = layout.panelWidth
  // The photo is fitted to the column inside the pane's padding, so it is never wider than the
  // pane and cut off at the sides.
  const contentWidth = paneWidth - 2 * PANE_PADDING
  // Always a width, never flex: switched from a width to flex on a turn, the pane kept the old
  // width and ran off the screen.
  const frameStyle = { width: paneWidth }
  const renderItem = useCallback(
    ({ item }: { item: IComment }) => (
      <Comment
        comment={item}
        users={users}
        onLinkPress={onLinkPress}
        replyWidth="94%"
        style={local.underPhoto}
      />
    ),
    [users, onLinkPress],
  )
  // Then-and-now covers the panel, and the cross that takes the then-and-now button's place in the
  // screen header brings the post back (see PanelActions). The post stays mounted underneath:
  // building it again on the way back reloaded its photos, which flickered.
  const comparing = !!(compareMode && comparePhoto)
  // Android's back button leaves then-and-now first. Only while this screen is in front: the other
  // tabs stay mounted with their own panels.
  useFocusEffect(
    useCallback(() => {
      if (!comparing) return
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        panel.closeCompare()
        return true
      })
      return () => subscription.remove()
    }, [comparing, panel]),
  )
  if (!postInfo) {
    return (
      <View style={[s.frame, frameStyle, s.modal]}>
        <Spacer height={18} />
        {/* A photo is picked: a spinner while its post is on its way, not "pick a photo". */}
        {panel.cid !== null ? (
          <Animated.View style={s.emptyContainer} entering={loaderEntering}>
            <ActivityIndicator color={colors.textFirst} accessibilityLabel={t('common.loading')} />
          </Animated.View>
        ) : (
          <View style={s.emptyContainer}>
            <Text style={[s.emptyText, { color: colors.textThird }]}>
              {t('collection.selectPhoto')}
            </Text>
          </View>
        )}
      </View>
    )
  }

  const target = comparing && panel.hasStreetView ? streetViewTarget(postInfo) : null
  return (
    <View style={[s.frame, frameStyle]}>
      {/* Keyed by the photo, so the next one (from the list, a link or the nearby row) fades in.
          Then-and-now and the colour leave it be. */}
      <Animated.View
        key={postInfo.cid}
        entering={postEntering}
        style={s.modal}
        pointerEvents={comparing ? 'none' : 'auto'}
        accessibilityElementsHidden={comparing}
        importantForAccessibility={comparing ? 'no-hide-descendants' : 'auto'}>
        <Spacer height={18} />
        {!panel.isImageLoaded && (
          <View
            style={[s.loaderContainer, local.loaderSpan, { backgroundColor: colors.backgroundApp }]}>
            {/* Not late, unlike the one above: the panel has waited already, and the spinner fades
                in with the post. */}
            <View style={s.emptyContainer}>
              <ActivityIndicator color={colors.textFirst} accessibilityLabel={t('common.loading')} />
            </View>
          </View>
        )}
        <FlatList
          // The list takes over the panel's side padding, so the nearby photos can scroll out to
          // the panel's edges instead of being cut off at the text column.
          style={{ marginHorizontal: -PANE_PADDING }}
          contentContainerStyle={{ paddingHorizontal: PANE_PADDING, paddingBottom: bottom + 16 }}
          showsVerticalScrollIndicator={false}
          data={comments}
          renderItem={renderItem}
          keyExtractor={item => item.cid}
          ListHeaderComponent={
            <PostInfo
              postInfo={postInfo!}
              imageLink={panel.imageLink}
              onImageLoaded={panel.onImageLoad}
              onImageResolution={panel.onImageResolution}
              openFullScreen={panel.openFullScreen}
              onLinkPress={onLinkPress}
              colorize={colorize}
              onOpenPhoto={onOpenPhoto}
              contentWidth={contentWidth}
            />
          }
        />
      </Animated.View>
      {comparing && (
        <View style={[s.modal, s.cover, { backgroundColor: colors.backgroundApp }]}>
          <Spacer height={18} />
          <CompareView
            colorizing={colorize.isColorizing}
            photo={comparePhoto!}
            initialMode={compareMode}
            target={target ? { ...target, panoId: streetView?.panoId } : null}
            panoramaYear={streetView?.year}
            fit="contain"
          />
        </View>
      )}
    </View>
  )
})

const local = StyleSheet.create({
  // Across the whole panel rather than wider than it from inside its padding, so the spinner sits
  // in the middle.
  loaderSpan: { left: 0, right: 0, width: 'auto' },
  // Below the photo in the list header, so the photo covers the comments while it is zoomed.
  underPhoto: { zIndex: -1 },
})
