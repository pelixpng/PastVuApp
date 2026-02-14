import { useCallback, useLayoutEffect } from 'react'
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native'
import { useFocusEffect, useNavigation, useTheme } from '@react-navigation/native'
import { observer } from 'mobx-react'
import CollectionVM, { CollectionTab } from './Collection.vm'
import { ItemHistory } from './components/itemHistory/Item'
import { useVM } from '../../../core/hooks/useVM'
import { Spacer } from '../../../core/components/ui/Spacer'
import { MenuButton } from '../../../core/components/ui/buttons/menuButton/MenuButton'
import { PhotoDetail } from './components/photoDetail/PhotoDetail'
import { Container } from '../../../core/components/ui/Container'
import { MaterialIcons } from '@expo/vector-icons'
import { SegmentedControl } from '../../../core/components/ui/segmentedControl/SegmentedControl'

export interface CollectionItem {
  title: string
  description: string
  cid: string
  file: string
}

const ListHeader = () => <Spacer height={8} />
const ListFooter = () => <Spacer height={80} />

const keyExtractor = (item: CollectionItem) => item.cid

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

  const renderItem = useCallback(
    ({ item }: { item: CollectionItem }) => (
      <ItemHistory
        title={item.title}
        description={item.description}
        file={item.file}
        isSelected={vm.selectedItem === item.cid}
        onPress={() => vm.showPhoto(item.cid)}
        onRemove={() => vm.showDeleteModal(item.cid)}
      />
    ),
    [vm],
  )

  return (
    <Container row>
      <View style={{ width: listWidth }}>
        <Spacer height={18} />
        <View style={s.segmentHeader}>
          <SegmentedControl
            options={vm.segmentOptions}
            selectedValue={vm.selectedTab}
            onChange={value => vm.setSelectedTab(value as CollectionTab)}
          />
        </View>
        <FlatList
          data={vm.displayedData}
          style={s.list}
          ListFooterComponent={ListFooter}
          keyExtractor={keyExtractor}
          ListHeaderComponent={ListHeader}
          renderItem={renderItem}
          initialNumToRender={10}
          maxToRenderPerBatch={5}
          windowSize={5}
          ListEmptyComponent={
            <View style={s.emptyContainer}>
              <MenuButton
                title={vm.selectedTab === 'viewed' ? 'История просмотра' : 'Избранное'}
                description={
                  vm.selectedTab === 'viewed'
                    ? 'История сохраняет последние 1000 просмотренных фотографий'
                    : 'Здесь будут отображаться ваши избранные фотографии'
                }
                icon={'history'}
              />
            </View>
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
      <Modal
        visible={vm.isDeleteModalVisible}
        transparent
        animationType="fade"
        supportedOrientations={['landscape']}
        onRequestClose={vm.hideDeleteModal}>
        <Pressable style={s.overlay} onPress={vm.hideDeleteModal}>
          <View style={[s.modalContainer, { backgroundColor: colors.baseSecond }]}>
            <Text style={[s.modalTitle, { color: colors.textThird }]}>
              {vm.deleteConfirmationTitle}
            </Text>
            <Spacer height={17} />
            <TouchableOpacity
              style={[s.modalButton, { backgroundColor: colors.baseFourth }]}
              onPress={vm.confirmDelete}
              activeOpacity={0.7}>
              <Text style={[s.modalButtonText, { color: colors.textFirst }]}>Удалить</Text>
            </TouchableOpacity>
            <Spacer height={8} />
            <TouchableOpacity
              style={s.modalCancelButton}
              onPress={vm.hideDeleteModal}
              activeOpacity={0.7}>
              <Text style={[s.modalButtonText, { color: colors.textFirst }]}>Отменить</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </Container>
  )
})

const s = StyleSheet.create({
  emptyContainer: { paddingHorizontal: 16, paddingTop: 16 },
  header: { flexDirection: 'row', marginRight: 16 },
  segmentHeader: { paddingHorizontal: 16 },
  list: { flex: 1 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    borderRadius: 32,
    paddingBottom: 16,
    paddingTop: 29,
    paddingHorizontal: 24,
    width: 360,
  },
  modalTitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    fontWeight: '400',
  },
  modalButton: {
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '800',
  },
  modalCancelButton: {
    paddingVertical: 10,
    alignItems: 'center',
  },
})
