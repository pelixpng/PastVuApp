import { Alert, FlatList, StyleSheet } from 'react-native'
import { ViewContainer } from '../../../components/ui/Containers'
import { MenuDescriptionText } from '../../../components/ui/Texts'
import { useVM } from '../../../hooks/useVM'
import { observer } from 'mobx-react'
import { PostInfo } from './components/postInfo/PostInfo'
import Pinchable from 'react-native-pinchable'
import { Comment } from './components/comment/Comment'
import { Image } from 'expo-image'
import PhotoDetailVM from './PhotoDetail.vm'

export const PhotoDetailScreen = observer(() => {
  const vm = useVM(PhotoDetailVM)
  if (!vm.postInfo && !vm.users && vm.comments.length === 0) {
    return (
      <ViewContainer>
        <MenuDescriptionText>Загрузка...</MenuDescriptionText>
      </ViewContainer>
    )
  }
  return (
    <ViewContainer>
      <Pinchable style={s.pinchable} maximumZoomScale={10}>
        <Image
          source={{ uri: `https://pastvu.com/_p/${vm.photoQuality}/${vm.postInfo?.file}` }}
          style={s.image}
          contentFit="contain"
          onError={() =>
            Alert.alert('Ошибка', 'Не удалось загрузить изображение, попробуйте позже')
          }
        />
      </Pinchable>
      <FlatList
        showsVerticalScrollIndicator={false}
        data={vm.comments}
        renderItem={({ item }) => <Comment comment={item} users={vm.users!} />}
        ListHeaderComponent={() => <PostInfo postInfo={vm.postInfo!} saveImage={vm.saveImage} />}
        ListHeaderComponentStyle={s.listHeader}
        style={s.listStyle}
        keyExtractor={item => item.cid}
      />
    </ViewContainer>
  )
})

const s = StyleSheet.create({
  pinchable: { width: '100%', height: '40%' },
  image: { flex: 1 },
  listHeader: { marginBottom: 12 },
  listStyle: { marginHorizontal: 16 },
})
