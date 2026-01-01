import { useCallback, useLayoutEffect } from 'react'
import { FlatList, StyleSheet, useWindowDimensions, View } from 'react-native'
import { useFocusEffect, useNavigation, useTheme } from '@react-navigation/native'
import { observer } from 'mobx-react'
import PhotoHistoryVM from './PhotoHistory.vm'
import { ItemHistory } from './components/itemHistory/Item'
import { useVM } from '../../../core/hooks/useVM'
import { Spacer } from '../../../core/components/ui/Spacer'
import { MenuButton } from '../../../core/components/ui/buttons/menuButton/MenuButton'
import { PhotoDetail } from './components/photoDetail/PhotoDetail'
import { Container } from '../../../core/components/ui/Container'
import { MaterialIcons } from '@expo/vector-icons'

export interface HistoryItem {
  title: string
  description: string
  cid: string
  file: string
}

export const PhotoHistoryScreen = observer(() => {
  const vm = useVM(PhotoHistoryVM)
  const { colors } = useTheme()
  const navigation = useNavigation()
  const { width } = useWindowDimensions()
  const listWidth = width * 0.33
  useFocusEffect(
    useCallback(() => {
      vm.getPhotos()
    }, [vm]),
  )
  useLayoutEffect(() => {
    if (!vm.postInfo) return
    navigation.setOptions({
      headerRight: () => (
        <View style={s.header}>
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
  }, [vm.postInfo, colors.textFirst, navigation])
  return (
    <Container row>
      <FlatList
        data={vm.photos}
        contentContainerStyle={{ width: listWidth, left: 16 }}
        ListFooterComponent={<Spacer height={80} />}
        keyExtractor={item => item.cid}
        ItemSeparatorComponent={() => <Spacer height={16} />}
        renderItem={({ item }) => (
          <ItemHistory
            title={item.title}
            description={item.description}
            file={item.file}
            isSelected={vm.selectedItem === item.cid}
            onPress={() => vm.showPhoto(item.cid)}
          />
        )}
        ListEmptyComponent={
          <MenuButton
            title={'История просмотра'}
            description={'История сохраняет последние 1000 просмотренных фотографий'}
            icon={'history'}
          />
        }
      />
      <PhotoDetail
        postInfo={vm.postInfo}
        users={vm.users}
        comments={vm.comments}
        onImageLoaded={vm.onImageLoad}
        imageLink={vm.imageLink}
        isImageLoaded={vm.isImageLoaded}
        showLoader={vm.showLoader}
        openFullScreen={vm.openFullScreenImage}
      />
    </Container>
  )
})

const s = StyleSheet.create({
  header: { flexDirection: 'row', marginRight: 16 },
})
