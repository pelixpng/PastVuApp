import { FlatList, StyleSheet, Text, View } from 'react-native'
import { observer } from 'mobx-react'
import { Comment } from './components/comment/Comment'
import PhotoDetailVM from './PhotoDetail.vm'
import { Container } from '../../../../core/components/ui/Container'
import { useNavigation, useTheme } from '@react-navigation/native'
import { PostInfo } from './components/postInfo/PostInfo'
import { Spacer } from '../../../../core/components/ui/Spacer'
import { useCallback, useLayoutEffect } from 'react'
import { MaterialIcons } from '@expo/vector-icons'
import { ImageZoom } from './components/imageView/ImageZoom'
import { useVM } from '../../../../core/hooks/useVM'

export const PhotoDetailScreen = observer(() => {
  const vm = useVM(PhotoDetailVM)
  const { colors } = useTheme()
  const renderItem = useCallback(({ item }) => <Comment comment={item} users={vm.users} />, [])
  const navigation = useNavigation()
  useLayoutEffect(() => {
    if (!vm.postInfo) return
    navigation.setOptions({
      headerRight: () => (
        <View style={s.backIcon}>
          <MaterialIcons
            name={vm.isFavorite ? 'favorite' : 'favorite-border'}
            size={24}
            color={vm.isFavorite ? '#FF6B6B' : colors.textFirst}
            onPress={vm.toggleFavorite}
          />
          <Spacer width={24} />
          <MaterialIcons
            name="save-alt"
            size={24}
            color={colors.textFirst}
            onPress={vm.saveImage}
          />
          <Spacer width={24} />
          <MaterialIcons name="share" size={24} color={colors.textFirst} onPress={vm.share} />
        </View>
      ),
    })
  }, [vm.postInfo, vm.isFavorite, colors.textFirst, navigation])

  if (!vm.postInfo && !vm.users) {
    return (
      <Container>
        <Text style={[s.titleText, { color: colors.textFirst }]}>Загрузка...</Text>
      </Container>
    )
  }
  return (
    <Container>
      <ImageZoom
        uri={vm.imageLink}
        openFullScreenImage={vm.openFullScreenImage}
        onImageLoaded={vm.onImageLoad}
      />
      <Spacer height={16} />
      {vm.isImageLoaded && (
        <FlatList
          showsVerticalScrollIndicator={false}
          data={vm.comments}
          renderItem={renderItem}
          ListHeaderComponent={<PostInfo postInfo={vm.postInfo!} />}
          style={s.listStyle}
          keyExtractor={item => item.cid}
        />
      )}
    </Container>
  )
})

const s = StyleSheet.create({
  listStyle: { marginHorizontal: 16 },
  titleText: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '800',
  },
  backIcon: { flexDirection: 'row', marginRight: 16 },
})
