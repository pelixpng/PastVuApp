import { FC, useCallback } from 'react'
import { View, Text, FlatList, Platform, useWindowDimensions } from 'react-native'
import Animated, { SlideInRight, SlideOutRight, runOnJS } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { HeaderIconButton } from '../../../../../core/components/ui/buttons/HeaderIconButton'
import { Spacer } from '../../../../../core/components/ui/Spacer'
import { useTheme } from '@react-navigation/native'
import { observer } from 'mobx-react-lite'
import { IComment, Users } from '../../../../../core/types/apiPhotoComment'
import { PostInfo } from '../postInfo/PostInfo'
import { Comment } from '../comment/Comment'
import { s } from './style'
import { t } from '../../../../../core/i18n'
import { CompareMode, ComparePhoto, CompareView } from '../../../../../core/components/compare/CompareView'
import { StreetViewInfo, streetViewTarget } from '../../../../../core/services/streetView'
import { refreshWindowRegion } from '../../../../../modules/window-region'
import { PostColorize } from '../../../../../core/store/PostColorize'
import { ColorizeButtons } from '../../../../../core/components/colorize/ColorizeButtons'

// Google Maps renders into a SurfaceView, so Android keeps a hint of which parts of the window are
// transparent over it. The hint is recomputed only in a window layout pass, which React Native never
// requests, and a stale hint lets the map show through the panel's edges (status bar strip, right
// edge). The outer view therefore stays still at the panel's final place and asks for that pass as
// soon as it is laid out, before the slide starts; the post slides in inside it. After the slide out
// the pass runs again so the map area becomes transparent again.
const afterSlideOut = (finished: boolean) => {
  'worklet'
  if (finished) runOnJS(refreshWindowRegion)()
}
const panelEntering = SlideInRight.duration(600)
const panelExiting = SlideOutRight.duration(600).withCallback(afterSlideOut)

type PhotoDetailProps = {
  comments: IComment[]
  users: Users | null
  postInfo: Photo | null
  imageLink: string
  isImageLoaded: boolean
  share: () => void
  saveImage: () => void
  onImageLoaded: () => void
  closePhoto: () => void
  openFullScreen: (original?: boolean) => void
  onLinkPress?: (href: string) => void
  colorize?: PostColorize
  hasStreetView?: boolean
  openCompare?: () => void
  compareMode?: CompareMode | null
  closeCompare?: () => void
  streetView?: StreetViewInfo | null
  comparePhoto?: ComparePhoto
  isFavorite?: boolean
  toggleFavorite?: () => void
}

// An observer: the colour state comes from PostColorize, not from the props.
export const PhotoDetail: FC<PhotoDetailProps> = observer(({
  closePhoto,
  comments,
  users,
  postInfo,
  imageLink,
  onImageLoaded,
  isImageLoaded,
  openFullScreen,
  saveImage,
  share,
  onLinkPress,
  colorize,
  hasStreetView,
  openCompare,
  compareMode,
  closeCompare,
  streetView,
  comparePhoto,
  isFavorite,
  toggleFavorite,
}) => {
  const { width } = useWindowDimensions()
  const { top, bottom } = useSafeAreaInsets()
  const { colors } = useTheme()
  const topLoader = top + 40
  const modalWidth = width * 0.67 - 32
  const renderItem = useCallback(({ item }: { item: IComment }) => <Comment comment={item} users={users} onLinkPress={onLinkPress} />, [users, onLinkPress])
  // Then-and-now covers the panel; the arrow brings the post back rather than closing it. The post
  // stays mounted underneath: building it again on the way back reloaded its photos, which flickered.
  const comparing = !!(compareMode && comparePhoto)
  const compare = comparing ? (
    <View style={[s.panel, { backgroundColor: colors.backgroundApp }]}>
      <View style={[s.header, { marginTop: top + 5, marginBottom: 5 }]}>
        <HeaderIconButton name="arrow-back" color={colors.textFirst} onPress={closeCompare} />
        {colorize && (
          <View style={s.iconContainer}>
            <ColorizeButtons colorize={colorize} showCompareOriginal={false} />
          </View>
        )}
      </View>
      <CompareView
        colorizing={colorize?.isColorizing}
        photo={comparePhoto}
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
  ) : null
  const post = (
    <View
      style={s.layer}
      pointerEvents={comparing ? 'none' : 'auto'}
      accessibilityElementsHidden={comparing}
      importantForAccessibility={comparing ? 'no-hide-descendants' : 'auto'}>
      <View style={[s.header, { marginTop: top + 5, marginBottom: 5 }]}>
        <HeaderIconButton name="arrow-back" color={colors.textFirst} onPress={closePhoto} />
        <View style={s.iconContainer}>
          {colorize && <ColorizeButtons colorize={colorize} />}
          <HeaderIconButton name="compare" color={colors.textFirst} onPress={openCompare} />
          <Spacer width={4} />
          <HeaderIconButton name={isFavorite ? 'favorite' : 'favorite-border'} color={colors.textFirst} onPress={toggleFavorite} />
          <Spacer width={4} />
          <HeaderIconButton name="save-alt" color={colors.textFirst} onPress={saveImage} />
          <Spacer width={4} />
          <HeaderIconButton name="share" color={colors.textFirst} onPress={share} />
        </View>
      </View>
      {!isImageLoaded && (
        <View
          style={[s.loaderContainer, { backgroundColor: colors.backgroundApp, top: topLoader }]}>
          <Text style={[s.titleText, { color: colors.textSecond }]}>{t('common.loading')}</Text>
        </View>
      )}
      <FlatList
        contentContainerStyle={{ paddingBottom: bottom + 16 }}
        style={s.postInfoContainer}
        showsVerticalScrollIndicator={false}
        data={comments}
        renderItem={renderItem}
        keyExtractor={item => item.cid}
        ListHeaderComponent={
          // Switching photos clears the post until the next one arrives; meanwhile the loader
          // covers the panel. Rendered without data, the photo's link ended in "undefined" and
          // the "no photo" icon flashed up (and took the loader away, as it counts as loaded).
          postInfo ? (
            <PostInfo
              postInfo={postInfo}
              imageLink={imageLink}
              onImageLoaded={onImageLoaded}
              openFullScreen={openFullScreen}
              onLinkPress={onLinkPress}
              colorize={colorize}
            />
          ) : null
        }
      />
    </View>
  )
  return (
    <Animated.View
      exiting={panelExiting}
      onLayout={refreshWindowRegion}
      pointerEvents="box-none"
      style={[s.modal, s.slideFrame, Platform.OS === 'android' && s.regionAnchor, { width: modalWidth }]}>
      <Animated.View
        entering={panelEntering}
        style={[s.panel, { backgroundColor: colors.backgroundApp }]}>
        {post}
        {compare}
      </Animated.View>
    </Animated.View>
  )
})
