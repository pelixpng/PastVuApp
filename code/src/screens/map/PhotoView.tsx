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

export type PhotoPageProps = {
  route: { params: { PhotoJson: PhotoInfo } }
}

export const PhotoPage: React.FC<PhotoPageProps> = observer(({ route }) => {
  const [comments, setComments] = useState<IComment[]>()
  const [users, setUsers] = useState<Users>()
  const { photoQualitySettings } = PhotoQualitySettings
  const {
    PhotoJson: {
      result: {
        photo: { file, title, y: years, regions, cid, author, desc: description, source: sourse },
      },
    },
  } = route.params
  useEffect(() => {
    const getComments = async () => {
      try {
        const response = await ApiService.getComments(cid.toString())
        setUsers(response.users)
        setComments(response.comments)
      } catch (error) {
        AlertModalService.infoAlert('Ошибка', 'Не удалось получить комментарии')
      }
    }
    getComments()
  }, [])

  return (
    <ViewContainer>
      <Pinchable style={{ width: '100%', height: '45%' }}>
        <Image
          source={{
            uri: `https://pastvu.com/_p/${photoQualitySettings}/${file}`,
          }}
          style={{ width: '100%', height: '100%' }}
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
            title={title}
            years={years}
            regions={regions}
            cid={cid}
            author={author}
            description={description}
            source={sourse}
            file={file}
          />
        )}
        ListHeaderComponentStyle={{ marginBottom: 10 }}
        keyExtractor={item => item.cid}
        contentContainerStyle={{
          paddingHorizontal: perfectSize(13),
          paddingTop: perfectSize(2),
        }}
      />
    </ViewContainer>
  )
})
