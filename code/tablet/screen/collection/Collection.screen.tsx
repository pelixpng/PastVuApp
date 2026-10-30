import { useCallback, useLayoutEffect } from 'react'
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { useSafeAreaFrame } from 'react-native-safe-area-context'
import { useFocusEffect, useNavigation, useTheme } from '@react-navigation/native'
import { observer } from 'mobx-react-lite'
import CollectionVM, { CollectionTab } from './Collection.vm'
import { ItemHistory } from './components/itemHistory/Item'
import { useVM } from '../../../core/hooks/useVM'
import { Spacer } from '../../../core/components/ui/Spacer'
import { MenuButton } from '../../../core/components/ui/buttons/menuButton/MenuButton'
import { PhotoDetail } from './components/photoDetail/PhotoDetail'
import { Container } from '../../../core/components/ui/Container'
import { HeaderIconButton } from '../../../core/components/ui/buttons/HeaderIconButton'
import { ColorizeButtons } from '../../../core/components/colorize/ColorizeButtons'
import { TranslateButton } from '../../../core/components/translate/TranslateButton'
import { SegmentedControl } from '../../../core/components/ui/segmentedControl/SegmentedControl'
import { t } from '../../../core/i18n'
import type { CollectionItem } from '../../../core/services/photoPost'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'

const ListHeader = () => <Spacer height={8} />
const ListFooter = () => <Spacer height={80} />

const keyExtractor = (item: CollectionItem) => item.cid

export const CollectionScreen = observer(() => {
  const vm = useVM(CollectionVM)
  const { panel } = vm
  const tabBarHeight = useBottomTabBarHeight()
  const { colors } = useTheme()
  const navigation = useNavigation()
  // The root view's width, not Dimensions: see core/hooks/useRootSize.
  const { width } = useSafeAreaFrame()
  const listWidth = width * 0.33
  useFocusEffect(
    useCallback(() => {
      vm.getPhotos()
    }, [vm]),
  )
  useLayoutEffect(() => {
    if (!panel.postInfo) return
    // Taken now: the post is cleared when another photo is picked, and the header may draw meanwhile.
    const { cid, title, desc } = panel.postInfo
    navigation.setOptions({
      headerRight: () => (
        <View style={s.header}>
          {/* Translation only over the post itself: then-and-now does not show its text. */}
          {!panel.compareMode && <TranslateButton cid={cid} title={title} desc={desc} />}
          {/* Palette and the comparison with the original; the latter not over the then-and-now view. */}
          <ColorizeButtons colorize={panel.colorize} showCompareOriginal={!panel.compareMode} />
          <HeaderIconButton name="compare" color={colors.textFirst} onPress={panel.openCompare} />
          <Spacer width={4} />
          <HeaderIconButton name={panel.isFavorite ? 'favorite' : 'favorite-border'} color={colors.textFirst} onPress={vm.toggleFavorite} />
          <Spacer width={4} />
          <HeaderIconButton name="save-alt" color={colors.textFirst} onPress={panel.saveImage} />
          <Spacer width={4} />
          <HeaderIconButton name="share" color={colors.textFirst} onPress={panel.share} />
        </View>
      ),
    })
  }, [panel.postInfo, panel.isFavorite, panel.compareMode, colors.textFirst, navigation])

  const renderItem = useCallback(
    ({ item }: { item: CollectionItem }) => (
      <ItemHistory
        title={item.title}
        description={item.description}
        file={item.file}
        isSelected={vm.panel.cid === item.cid}
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
          // Rows read the selection inside renderItem, which the list does not track.
          extraData={panel.cid}
          style={s.list}
          // The tablet tab bar floats over the content, so the list needs to end above it.
          contentContainerStyle={{ paddingBottom: tabBarHeight + 16 }}
          ListFooterComponent={ListFooter}
          keyExtractor={keyExtractor}
          ListHeaderComponent={ListHeader}
          renderItem={renderItem}
          initialNumToRender={10}
          maxToRenderPerBatch={5}
          windowSize={5}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={s.emptyContainer}>
              <MenuButton
                title={vm.selectedTab === 'viewed' ? t('collection.historyTitle') : t('collection.favorites')}
                description={
                  vm.selectedTab === 'viewed'
                    ? t('collection.historyHint')
                    : t('collection.favoritesHint')
                }
                icon={'history'}
              />
            </View>
          }
        />
      </View>
      <PhotoDetail panel={panel} onLinkPress={vm.openPhotoFromLink} onOpenPhoto={vm.showPhoto} />
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
              <Text style={[s.modalButtonText, { color: colors.textFirst }]}>{t('common.delete')}</Text>
            </TouchableOpacity>
            <Spacer height={8} />
            <TouchableOpacity
              style={s.modalCancelButton}
              onPress={vm.hideDeleteModal}
              activeOpacity={0.7}>
              <Text style={[s.modalButtonText, { color: colors.textFirst }]}>{t('common.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </Container>
  )
})

const s = StyleSheet.create({
  emptyContainer: { paddingHorizontal: 16, paddingTop: 16 },
  // 44 pt buttons around 24 pt glyphs: 6 keeps the glyphs 16 from the edge.
  header: { flexDirection: 'row', marginRight: 6 },
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
