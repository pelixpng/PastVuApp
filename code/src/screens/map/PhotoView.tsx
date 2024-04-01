import React, { useEffect, useState } from 'react'
import { ViewContainer } from '../../components/ui/UniversalComponents'
import { PostInfo } from '../../components/post/PostInfo'
import { observer } from 'mobx-react-lite'
import PhotoQualitySettings from '../../mobx/PhotoSettingsStore'
import Pinchable from 'react-native-pinchable'
import AlertModalService from '../../utils/AlertModalService'
import { Image } from 'expo-image'
import { IComment, Users } from '../../types/apiPhotoComment'
import ApiService from '../../api/PastVuApi'
import { FlatList } from 'react-native'
import { perfectSize } from '../../utils/ScreenSize'
import { Comment } from '../../components/post/Comment'
import { StyleSheet } from 'react-native'
import StorageServiceMMKV from '../../storage/Storage'
import { TitleText } from '../../components/history/Item'

export type PhotoPageProps = {
  route: { params: { cid: string } }
}

export const PhotoPage: React.FC<PhotoPageProps> = observer(({ route }) => {
  const cid = route.params.cid
  const [comments, setComments] = useState<IComment[]>()
  const [users, setUsers] = useState<Users>()
  const [postInfo, setPostInfo] = useState<Photo>()
  const { photoQualitySettings } = PhotoQualitySettings
  useEffect(() => {
    const getPostInfo = async () => {
      await ApiService.getPhotoInfo(cid)
        .then(({ result }) => {
          setPostInfo(result.photo),
            StorageServiceMMKV.saveHistory(
              cid,
              result.photo.title,
              `${result.photo.y} ${result.photo.regions
                .map(region => region.title_local)
                .join(', ')}`,
              result.photo.file,
            )
        })
        .catch(() => AlertModalService.infoAlert('Ошибка', 'Не удалось получить информацию о фото'))
      await ApiService.getComments(cid)
        .then(({ users, comments }) => {
          setUsers(users), setComments(comments)
        })
        .catch(() => AlertModalService.infoAlert('Ошибка', 'Не удалось получить комментарии'))
    }
    getPostInfo()
  }, [])

  if (postInfo) {
    return (
      <ViewContainer>
        <Pinchable style={s.pinchable}>
          <Image
            source={{
              uri: `https://pastvu.com/_p/${photoQualitySettings}/${postInfo.file}`,
            }}
            style={s.image}
            contentFit="contain"
            onError={() =>
              AlertModalService.infoAlert(
                'Ошибка',
                'Не удалось загрузить изображение, попробуйте позже',
              )
            }
          />
        </Pinchable>
        <FlatList
          data={comments}
          renderItem={({ item }) => (
            <Comment
              uri={users && users[item.user].avatar}
              name={item.user}
              text={item.txt}
              width={item.parent ? '88%' : '100%'}
              stamp={item.stamp}
            />
          )}
          ListHeaderComponent={() => (
            <PostInfo
              title={postInfo.title}
              years={postInfo.y}
              regions={postInfo?.regions}
              cid={cid}
              author={postInfo.author}
              description={postInfo.desc}
              source={postInfo.source}
              file={postInfo.file}
            />
          )}
          ListHeaderComponentStyle={s.listHeader}
          keyExtractor={item => item.cid}
          contentContainerStyle={s.contentContainer}
        />
      </ViewContainer>
    )
  }
  return (
    <ViewContainer>
      <TitleText>Загрузка...</TitleText>
    </ViewContainer>
  )
})

const s = StyleSheet.create({
  pinchable: { width: '100%', height: '45%' },
  image: { width: '100%', height: '100%' },
  listHeader: { marginBottom: 10 },
  contentContainer: {
    paddingHorizontal: perfectSize(13),
    paddingTop: perfectSize(2),
  },
})
