import { useCallback, useLayoutEffect } from 'react'
import { FlatList, StyleSheet, useWindowDimensions, View } from 'react-native'
import { useFocusEffect, useNavigation, useTheme } from '@react-navigation/native'
import { observer } from 'mobx-react'
import CollectionVM, { CollectionTab } from './PhotoHistory.vm'
import { ItemHistory } from './components/itemHistory/Item'
import { useVM } from '../../../core/hooks/useVM'
import { Spacer } from '../../../core/components/ui/Spacer'
import { MenuButton } from '../../../core/components/ui/buttons/menuButton/MenuButton'
import { PhotoDetail } from './components/photoDetail/PhotoDetail'
import { Container } from '../../../core/components/ui/Container'
import { MaterialIcons } from '@expo/vector-icons'
import { SegmentedControl } from '../../../core/components/ui/segmentedControl/SegmentedControl'
import { ConfirmationSheet } from '../../../core/components/ui/confirmationSheet/ConfirmationSheet'

export interface CollectionItem {
  title: string
  description: string
  cid: string
  file: string
}

export const CollectionScreen = observer(() => {
  const vm = useVM(CollectionVM)
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
            name={vm.isFavorite ? 'favorite' : 'favorite-border'}
            size={24}
            color={colors.textFirst}
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
  return (
    <Container row>
      <View style={{ width: listWidth, paddingLeft: 16 }}>
        <Spacer height={18} />
        <SegmentedControl
          options={vm.segmentOptions}
          selectedValue={vm.selectedTab}
          onChange={value => vm.setSelectedTab(value as CollectionTab)}
        />
        <FlatList
          data={vm.displayedData}
          style={s.list}
          ListFooterComponent={<Spacer height={80} />}
          keyExtractor={item => item.cid}
          ListHeaderComponent={() => <Spacer height={16} />}
          ItemSeparatorComponent={() => <Spacer height={16} />}
          renderItem={({ item }) => (
            <ItemHistory
              title={item.title}
              description={item.description}
              file={item.file}
              isSelected={vm.selectedItem === item.cid}
              onPress={() => vm.showPhoto(item.cid)}
              onRemove={() => vm.showDeleteConfirmation(item.cid)}
            />
          )}
          ListEmptyComponent={
            <MenuButton
              title={vm.selectedTab === 'viewed' ? 'История просмотра' : 'Избранное'}
              description={
                vm.selectedTab === 'viewed'
                  ? 'История сохраняет последние 1000 просмотренных фотографий'
                  : 'Здесь будут отображаться ваши избранные фотографии'
              }
              icon={'history'}
            />
          }
        />
      </View>
      <PhotoDetail
        postInfo={vm.postInfo}
        users={vm.users}
        comments={vm.comments}
        onImageLoaded={vm.onImageLoad}
        imageLink={vm.imageLink}
        isImageLoaded={vm.isImageLoaded}
        showLoader={vm.showLoader}
        openFullScreen={vm.openFullScreenImage}
        onLinkPress={vm.openPhotoFromLink}
      />
      <ConfirmationSheet
        visible={vm.isDeleteModalVisible}
        title={vm.deleteConfirmationTitle}
        onConfirm={vm.confirmDelete}
        onCancel={vm.hideDeleteConfirmation}
      />
    </Container>
  )
})

const s = StyleSheet.create({
  header: { flexDirection: 'row', marginRight: 16 },
  list: { flex: 1 },
})