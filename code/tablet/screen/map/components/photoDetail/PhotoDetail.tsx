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
}) => {
  const { width } = useWindowDimensions()
  const { top } = useSafeAreaInsets()
  const { colors } = useTheme()
  const topLoader = top + 40
  const modalWidth = width * 0.67 - 32
  const renderItem = useCallback(({ item }) => <Comment comment={item} users={users} />, [users])
  return (
    <Animated.View
      entering={SlideInRight.duration(600)}
      exiting={SlideOutRight.duration(600)}
      style={[s.modal, { backgroundColor: colors.backgroundApp, width: modalWidth }]}>
      <View style={[s.header, { marginTop: top + 5, marginBottom: 5 }]}>
        <MaterialIcons name="arrow-back" size={24} color={colors.textFirst} onPress={closePhoto} />
        <View style={s.iconContainer}>
          <MaterialIcons name="save-alt" size={24} color={colors.textFirst} onPress={saveImage} />
          <Spacer width={24} />
          <MaterialIcons name="share" size={24} color={colors.textFirst} onPress={share} />
        </View>
      </View>
      {!isImageLoaded && (
        <View
          style={[s.loaderContainer, { backgroundColor: colors.backgroundApp, top: topLoader }]}>
          <Text style={[s.titleText, { color: colors.textSecond }]}>Загрузка...</Text>
        </View>
      )}
      <FlatList
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
          />
        }
      />
    </Animated.View>
  )
}
