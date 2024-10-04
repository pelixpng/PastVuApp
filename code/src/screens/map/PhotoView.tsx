import { useEffect, useState, FC, useCallback } from 'react'
import { ViewContainer } from '../../components/ui/Containers'
import { PostInfo } from '../../components/post/postInfo/PostInfo'
import { observer } from 'mobx-react-lite'
import PhotoQualitySettings from '../../mobx/PhotoSettingsStore'
import Pinchable from 'react-native-pinchable'
import { Image } from 'expo-image'
import { IComment, Users } from '../../types/apiPhotoComment'
import ApiService from '../../api/PastVuApi'
import { Alert, FlatList, Share, StyleSheet } from 'react-native'
import { Comment } from '../../components/post/comment/Comment'
import { MMKVStorage } from '../../storage/Storage'
import { HistoryItem } from './History'
import { useNavigation } from '@react-navigation/native'
import { MaterialIcons } from '@expo/vector-icons'
import { useTheme } from 'styled-components/native'
import { MenuDescriptionText } from '../../components/ui/Texts'

export type PhotoPageProps = {
  route: { params: { cid: string } }
}

export const PhotoPage: FC<PhotoPageProps> = observer(({ route }) => {
  const { cid } = route.params
  const theme = useTheme()
  const navigation = useNavigation()
  const [comments, setComments] = useState<IComment[]>([])
  const [users, setUsers] = useState<Users>()
  const [postInfo, setPostInfo] = useState<Photo>()
  const { photoQualitySettings } = PhotoQualitySettings
  const getPostInfo = useCallback(async () => {
    try {
      const { result } = await ApiService.getPhotoInfo(cid)
      setPostInfo(result.photo)
      const history: HistoryItem[] = MMKVStorage.get('History') ?? []
      const title = result.photo.title
      const description = `${result.photo.y} ${result.photo.regions
        .map(region => region.title_local)
        .join(', ')}`
      const file = result.photo.file
      if (!history.some(item => item.cid === cid)) {
        MMKVStorage.set('History', [{ title, description, cid, file }, ...history])
      }
      navigation.setOptions({
        headerRight: () => (
          <MaterialIcons
            name={'share'}
            size={24}
            onPress={() =>
              Share.share({
                message: `${title}: https://pastvu.com/p/${cid}`,
              })
            }
            color={theme.colors.textFirst}
            style={styles.share}
          />
        ),
      })
      if (result.photo?.ccount) {
        const { users, comments } = await ApiService.getComments(cid)
        setUsers(users)
        setComments(comments)
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось загрузить информацию о фото')
    }
  }, [cid, navigation, theme])
  useEffect(() => {
    getPostInfo()
  }, [getPostInfo])
  if (!postInfo) {
    return (
      <ViewContainer>
        <MenuDescriptionText>Загрузка...</MenuDescriptionText>
      </ViewContainer>
    )
  }
  return (
    <ViewContainer>
      <Pinchable style={styles.pinchable}>
        <Image
          source={{ uri: `https://pastvu.com/_p/${photoQualitySettings}/${postInfo.file}` }}
          style={styles.image}
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
            uri={users?.[item.user]?.avatar}
            name={item.user}
            text={item.txt}
            isParent={item.parent}
            stamp={item.stamp}
          />
        )}
        ListHeaderComponent={() => (
          <PostInfo
            title={postInfo.title}
            years={postInfo.y}
            regions={postInfo.regions}
            author={postInfo.author}
            description={postInfo.desc}
            source={postInfo.source}
            file={postInfo.file}
            lastEdit={postInfo.cdate}
            commentsCount={postInfo.ccount}
          />
        )}
        ListHeaderComponentStyle={styles.listHeader}
        style={styles.listStyle}
        keyExtractor={item => item.cid}
      />
    </ViewContainer>
  )
})

const styles = StyleSheet.create({
  pinchable: { width: '100%', height: '40%' },
  image: { flex: 1 },
  listHeader: { marginBottom: 12 },
  share: { marginRight: 16 },
  listStyle: { marginHorizontal: 16 },
})
