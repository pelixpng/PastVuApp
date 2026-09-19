import { FC, useCallback } from 'react'
import { View, Text, FlatList, useWindowDimensions } from 'react-native'
import Animated, { SlideInRight, SlideOutRight } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { MaterialIcons } from '@expo/vector-icons'
import { Spacer } from '../../../../../core/components/ui/Spacer'
import { useTheme } from '@react-navigation/native'
import { IComment, Users } from '../../../../../core/types/apiPhotoComment'
import { PostInfo } from '../postInfo/PostInfo'
import { Comment } from '../comment/Comment'
import { s } from './style'
import { t } from '../../../../../core/i18n'
import { CompareMode, ComparePhoto, CompareView } from '../../../../../core/components/compare/CompareView'
import { StreetViewInfo, streetViewTarget } from '../../../../../core/services/streetView'

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
  openFullScreen: () => void
  onLinkPress?: (href: string) => void
  hasStreetView?: boolean
  openCompare?: () => void
  compareMode?: CompareMode | null
  closeCompare?: () => void
  streetView?: StreetViewInfo | null
  comparePhoto?: ComparePhoto
  isFavorite?: boolean
  toggleFavorite?: () => void
}

export const PhotoDetail: FC<PhotoDetailProps> = ({
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
  if (compareMode && comparePhoto) {
    // Then-and-now takes over the panel; the arrow brings the post back rather than closing it.
    return (
      <Animated.View
        entering={SlideInRight.duration(600)}
        exiting={SlideOutRight.duration(600)}
        style={[s.modal, { backgroundColor: colors.backgroundApp, width: modalWidth }]}>
        <View style={[s.header, { marginTop: top + 5, marginBottom: 5 }]}>
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
      </Animated.View>
    )
  }
  return (
    <Animated.View
      entering={SlideInRight.duration(600)}
      exiting={SlideOutRight.duration(600)}
      style={[s.modal, { backgroundColor: colors.backgroundApp, width: modalWidth }]}>
      <View style={[s.header, { marginTop: top + 5, marginBottom: 5 }]}>
        <MaterialIcons name="arrow-back" size={24} color={colors.textFirst} onPress={closePhoto} />
        <View style={s.iconContainer}>
          <MaterialIcons
            name="compare"
            size={24}
            color={colors.textFirst}
            onPress={openCompare}
          />
          <Spacer width={24} />
          <MaterialIcons
            name={isFavorite ? 'favorite' : 'favorite-border'}
            size={24}
            color={colors.textFirst}
            onPress={toggleFavorite}
          />
          <Spacer width={24} />
          <MaterialIcons name="save-alt" size={24} color={colors.textFirst} onPress={saveImage} />
          <Spacer width={24} />
          <MaterialIcons name="share" size={24} color={colors.textFirst} onPress={share} />
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
          <PostInfo
            postInfo={postInfo!}
            imageLink={imageLink}
            onImageLoaded={onImageLoaded}
            openFullScreen={openFullScreen}
            onLinkPress={onLinkPress}
          />
        }
      />
    </Animated.View>
  )
}
