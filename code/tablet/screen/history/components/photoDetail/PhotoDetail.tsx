import { FC, useCallback } from 'react'
import { View, Text, FlatList, useWindowDimensions } from 'react-native'
import { useTheme } from '@react-navigation/native'
import { IComment, Users } from '../../../../../core/types/apiPhotoComment'
import { s } from './style'
import { PostInfo } from '../../../map/components/postInfo/PostInfo'
import { Comment } from '../../../map/components/comment/Comment'

type PhotoDetailProps = {
  comments: IComment[]
  users: Users | null
  postInfo: Photo | null
  imageLink: string
  isImageLoaded: boolean
  showLoader: boolean
  onImageLoaded: () => void
  openFullScreen: () => void
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
}) => {
  const { colors } = useTheme()
  const { width } = useWindowDimensions()
  const modalWidth = width * 0.67 - 32
  const renderItem = useCallback(({ item }) => <Comment comment={item} users={users} />, [users])
  return (
    <View style={[s.modal, { width: modalWidth }]}>
      {!isImageLoaded && (
        <View style={[s.loaderContainer, { backgroundColor: colors.backgroundApp }]}>
          {showLoader && (
            <Text style={[s.titleText, { color: colors.textFirst }]}>Загрузка...</Text>
          )}
        </View>
      )}
      <FlatList
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
    </View>
  )
}
