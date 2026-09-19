import { FC, useCallback } from 'react'
import { View, Text, FlatList, useWindowDimensions } from 'react-native'
import { useTheme } from '@react-navigation/native'
import { IComment, Users } from '../../../../../core/types/apiPhotoComment'
import { s } from './style'
import { PostInfo } from '../../../map/components/postInfo/PostInfo'
import { Comment } from '../../../map/components/comment/Comment'
import { Spacer } from '../../../../../core/components/ui/Spacer'
import { t } from '../../../../../core/i18n'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { MaterialIcons } from '@expo/vector-icons'
import { CompareMode, ComparePhoto, CompareView } from '../../../../../core/components/compare/CompareView'
import { StreetViewInfo, streetViewTarget } from '../../../../../core/services/streetView'

type PhotoDetailProps = {
  comments: IComment[]
  users: Users | null
  postInfo: Photo | null
  imageLink: string
  isImageLoaded: boolean
  showLoader: boolean
  onImageLoaded: () => void
  openFullScreen: () => void
  onLinkPress?: (href: string) => void
  compareMode?: CompareMode | null
  closeCompare?: () => void
  hasStreetView?: boolean
  streetView?: StreetViewInfo | null
  comparePhoto?: ComparePhoto
}

export const PhotoDetail: FC<PhotoDetailProps> = ({
  comments,
  users,
  postInfo,
  imageLink,
  onImageLoaded,
  isImageLoaded,
  showLoader,
  openFullScreen,
  onLinkPress,
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
        <View style={s.emptyContainer}>
          <Text style={[s.emptyText, { color: colors.textThird }]}>
            {t('collection.selectPhoto')}
          </Text>
        </View>
      </View>
    )
  }

  if (compareMode && comparePhoto) {
    // Then-and-now takes over the panel; the arrow brings the post back.
    return (
      <View style={[s.modal, { width: modalWidth }]}>
        <Spacer height={18} />
        <View style={s.header}>
          <MaterialIcons name="arrow-back" size={24} color={colors.textFirst} onPress={closeCompare} />
        </View>
        <CompareView
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
    )
  }
  return (
    <View style={[s.modal, { width: modalWidth }]}>
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
          />
        }
      />
    </View>
  )
}
