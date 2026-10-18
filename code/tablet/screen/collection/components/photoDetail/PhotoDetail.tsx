import { FC, useCallback } from 'react'
import {
  ActivityIndicator,
  View,
  Text,
  FlatList,
  StyleSheet,
} from 'react-native'
import Animated, { Easing, FadeIn } from 'react-native-reanimated'
import { useTheme } from '@react-navigation/native'
import { observer } from 'mobx-react-lite'
import { IComment, Users } from '../../../../../core/types/apiPhotoComment'
import { s } from './style'
import { PostInfo } from '../../../map/components/postInfo/PostInfo'
import { Comment } from '../../../map/components/comment/Comment'
import { Spacer } from '../../../../../core/components/ui/Spacer'
import { t } from '../../../../../core/i18n'
import { useSafeAreaFrame, useSafeAreaInsets } from 'react-native-safe-area-context'
import { HeaderIconButton } from '../../../../../core/components/ui/buttons/HeaderIconButton'
import { CompareMode, ComparePhoto, CompareView } from '../../../../../core/components/compare/CompareView'
import { StreetViewInfo, streetViewTarget } from '../../../../../core/services/streetView'
import { PostColorize } from '../../../../../core/store/PostColorize'

// As on the phone: the next photo's post fades in rather than snapping into place, and the spinner
// comes late, so a post that is already cached does not flash it.
const postEntering = FadeIn.duration(220).easing(Easing.out(Easing.cubic))
const loaderEntering = FadeIn.delay(150).duration(200)

type PhotoDetailProps = {
  comments: IComment[]
  users: Users | null
  postInfo: Photo | null
  imageLink: string
  isImageLoaded: boolean
  showLoader: boolean
  /** A photo is picked: while its post is on its way the panel shows a spinner, not "pick a photo". */
  photoSelected?: boolean
  onImageLoaded: () => void
  openFullScreen: (original?: boolean) => void
  onLinkPress?: (href: string) => void
  colorize?: PostColorize
  compareMode?: CompareMode | null
  closeCompare?: () => void
  hasStreetView?: boolean
  streetView?: StreetViewInfo | null
  comparePhoto?: ComparePhoto
  /** Opens another photo in this panel, here from the nearby photos. */
  onOpenPhoto?: (cid: string) => void
}

// An observer: the colour state comes from PostColorize, not from the props.
export const PhotoDetail: FC<PhotoDetailProps> = observer(({
  comments,
  users,
  postInfo,
  imageLink,
  onImageLoaded,
  isImageLoaded,
  showLoader,
  photoSelected = false,
  openFullScreen,
  onLinkPress,
  colorize,
  compareMode,
  closeCompare,
  hasStreetView,
  streetView,
  comparePhoto,
  onOpenPhoto,
}) => {
  const { colors } = useTheme()
  const { bottom } = useSafeAreaInsets()
  // The root view's width, not Dimensions: see core/hooks/useRootSize.
  const { width } = useSafeAreaFrame()
  const modalWidth = width * 0.67 - 32
  const renderItem = useCallback(
    ({ item }: { item: IComment }) => (
      <Comment comment={item} users={users} onLinkPress={onLinkPress} />
    ),
    [users, onLinkPress],
  )
  if (!postInfo) {
    return (
      <View style={[s.modal, { width: modalWidth }]}>
        <Spacer height={18} />
        {photoSelected ? (
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

  // Then-and-now covers the panel; the arrow brings the post back. The post stays mounted
  // underneath: building it again on the way back reloaded its photos, which flickered.
  const comparing = !!(compareMode && comparePhoto)
  return (
    <View style={[s.frame, { width: modalWidth }]}>
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
        {!isImageLoaded && (
          <View
            style={[s.loaderContainer, local.loaderSpan, { backgroundColor: colors.backgroundApp }]}>
            {/* Not late, unlike the one above: the panel has waited already, and the spinner fades
                in with the post. */}
            {showLoader && (
              <View style={s.emptyContainer}>
                <ActivityIndicator color={colors.textFirst} accessibilityLabel={t('common.loading')} />
              </View>
            )}
          </View>
        )}
        <FlatList
          // The list takes over the panel's side padding, so the nearby photos can scroll out to
          // the panel's edges instead of being cut off at the text column.
          style={{ marginHorizontal: -16 }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: bottom + 16 }}
          showsVerticalScrollIndicator={false}
          data={comments}
          renderItem={renderItem}
          keyExtractor={item => item.cid}
          ListHeaderComponent={
            <PostInfo
              postInfo={postInfo!}
              imageLink={imageLink}
              onImageLoaded={onImageLoaded}
              openFullScreen={openFullScreen}
              onLinkPress={onLinkPress}
              colorize={colorize}
              onOpenPhoto={onOpenPhoto}
            />
          }
        />
      </Animated.View>
      {comparing && (
        <View style={[s.modal, s.cover, { backgroundColor: colors.backgroundApp }]}>
          <Spacer height={18} />
          <View style={s.header}>
            <HeaderIconButton name="arrow-back" color={colors.textFirst} onPress={closeCompare} />
          </View>
          <CompareView
            colorizing={colorize?.isColorizing}
            photo={comparePhoto!}
            initialMode={compareMode}
            target={
              hasStreetView && streetViewTarget(postInfo)
                ? { ...streetViewTarget(postInfo)!, panoId: streetView?.panoId }
                : null
            }
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
})
