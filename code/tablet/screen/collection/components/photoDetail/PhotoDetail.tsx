import { FC, useCallback } from 'react'
import { View, Text, FlatList, useWindowDimensions } from 'react-native'
import { useTheme } from '@react-navigation/native'
import { observer } from 'mobx-react-lite'
import { IComment, Users } from '../../../../../core/types/apiPhotoComment'
import { s } from './style'
import { PostInfo } from '../../../map/components/postInfo/PostInfo'
import { Comment } from '../../../map/components/comment/Comment'
import { Spacer } from '../../../../../core/components/ui/Spacer'
import { t } from '../../../../../core/i18n'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { HeaderIconButton } from '../../../../../core/components/ui/buttons/HeaderIconButton'
import { CompareMode, ComparePhoto, CompareView } from '../../../../../core/components/compare/CompareView'
import { StreetViewInfo, streetViewTarget } from '../../../../../core/services/streetView'
import { PostColorize } from '../../../../../core/store/PostColorize'

type PhotoDetailProps = {
  comments: IComment[]
  users: Users | null
  postInfo: Photo | null
  imageLink: string
  isImageLoaded: boolean
  showLoader: boolean
  /** A photo is picked: while its post is on its way the panel stays blank, not "pick a photo". */
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
}) => {
  const { colors } = useTheme()
  const { bottom } = useSafeAreaInsets()
  const { width } = useWindowDimensions()
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
        {!photoSelected && (
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
      <View
        style={s.modal}
        pointerEvents={comparing ? 'none' : 'auto'}
        accessibilityElementsHidden={comparing}
        importantForAccessibility={comparing ? 'no-hide-descendants' : 'auto'}>
        <Spacer height={18} />
        {!isImageLoaded && (
          <View style={[s.loaderContainer, { backgroundColor: colors.backgroundApp }]}>
            {showLoader && (
              <Text style={[s.titleText, { color: colors.textFirst }]}>{t('common.loading')}</Text>
            )}
          </View>
        )}
        <FlatList
          contentContainerStyle={{ paddingBottom: bottom + 16 }}
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
            />
          }
        />
      </View>
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
