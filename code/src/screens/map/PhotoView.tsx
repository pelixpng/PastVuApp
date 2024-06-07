import { useEffect, useState, FC } from 'react'
import { ViewContainer } from '../../components/ui/UniversalComponents'
import { PostInfo } from '../../components/post/PostInfo'
import { observer } from 'mobx-react-lite'
import PhotoQualitySettings from '../../mobx/PhotoSettingsStore'
import Pinchable from 'react-native-pinchable'
import { Image } from 'expo-image'
import { IComment, Users } from '../../types/apiPhotoComment'
import ApiService from '../../api/PastVuApi'
import { Alert, FlatList } from 'react-native'
import { Comment } from '../../components/post/Comment'
import { StyleSheet } from 'react-native'
import { MMKVStorage } from '../../storage/Storage'
import { TitleText } from '../../components/history/Item'
import { HistoryItem } from './History'

export type PhotoPageProps = {
  route: { params: { cid: string } }
}

export const PhotoPage: FC<PhotoPageProps> = observer(({ route }) => {
  const cid = route.params.cid
  const [comments, setComments] = useState<IComment[]>()
  const [users, setUsers] = useState<Users>()
  const [postInfo, setPostInfo] = useState<Photo>()
  const { photoQualitySettings } = PhotoQualitySettings
  useEffect(() => {
    const getPostInfo = async () => {
      await ApiService.getPhotoInfo(cid)
        .then(({ result }) => {
          setPostInfo(result.photo)
          const parseArr: HistoryItem[] = MMKVStorage.get('History') ?? []
          const title = result.photo.title
          const description = `${result.photo.y} ${result.photo.regions
            .map(region => region.title_local)
            .join(', ')}`
          const file = result.photo.file
          if (!parseArr.some(obj => obj.cid === cid)) {
            parseArr.unshift({ title, description, cid, file })
            MMKVStorage.set('History', parseArr)
          }
        })
        .catch(() => Alert.alert('Ошибка', 'Не удалось загрузить информацию о фото'))
      await ApiService.getComments(cid)
        .then(({ users, comments }) => {
          setUsers(users), setComments(comments)
        })
        .catch(() => Alert.alert('Ошибка', 'Не удалось получить комментарии'))
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
              Alert.alert('Ошибка', 'Не удалось загрузить изображение, попробуйте позже')
            }
          />
        </Pinchable>
        <FlatList
          showsVerticalScrollIndicator={false}
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
  image: { flex: 1 },
  listHeader: { marginBottom: 10 },
  contentContainer: {
    paddingHorizontal: 13,
    paddingTop: 2,
  },
})
