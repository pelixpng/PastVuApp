import { Alert, FlatList, StyleSheet, Text } from 'react-native'
import { useVM } from '../../../hooks/useVM'
import { observer } from 'mobx-react'
import Pinchable from 'react-native-pinchable'
import { Comment } from './components/comment/Comment'
import { Image } from 'expo-image'
import PhotoDetailVM from './PhotoDetail.vm'
import { Container } from '../../../components/ui/Container'
import { useTheme } from '@react-navigation/native'
import { PostInfo } from './components/postInfo/PostInfo'
import { Spacer } from '../../../components/ui/Spacer'
import { useCallback } from 'react'

export const PhotoDetailScreen = observer(() => {
  const vm = useVM(PhotoDetailVM)
  const { colors } = useTheme()
  const renderItem = useCallback(({ item }) => <Comment comment={item} users={vm.users} />, [])
  if (!vm.postInfo && !vm.users && vm.comments.length === 0) {
    return (
      <Container>
        <Text style={[s.titleText, { color: colors.textFirst }]}>Загрузка...</Text>
      </Container>
    )
  }
  return (
    <Container>
      <Pinchable style={s.pinchable} maximumZoomScale={10}>
        <Image
          source={{ uri: `https://img.pastvu.com/${vm.photoQuality}/${vm.postInfo?.file}` }}
          style={s.image}
          contentFit="contain"
          onError={() =>
            Alert.alert('Ошибка', 'Не удалось загрузить изображение, попробуйте позже')
          }
        />
      </Pinchable>
      <Spacer height={16} />
      <FlatList
        showsVerticalScrollIndicator={false}
        data={vm.comments}
        renderItem={renderItem}
        ListHeaderComponent={<PostInfo postInfo={vm.postInfo!} saveImage={vm.saveImage} />}
        style={s.listStyle}
        keyExtractor={item => item.cid}
      />
    </Container>
  )
})

const s = StyleSheet.create({
  pinchable: { width: '100%', height: '40%' },
  image: { flex: 1 },
  listStyle: { marginHorizontal: 16 },
  titleText: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '800',
  },
})
