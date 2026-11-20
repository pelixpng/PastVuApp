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
import { useFocusEffect, useNavigation, useTheme } from '@react-navigation/native'
import { observer } from 'mobx-react-lite'
import CollectionVM, { CollectionTab } from './Collection.vm'
import { ItemHistory } from './components/itemHistory/Item'
import { useVM } from '../../../core/hooks/useVM'
import { Spacer } from '../../../core/components/ui/Spacer'
import { MenuButton } from '../../../core/components/ui/buttons/menuButton/MenuButton'
import { PhotoDetail } from './components/photoDetail/PhotoDetail'
import { Container } from '../../../core/components/ui/Container'
import { SegmentedControl } from '../../../core/components/ui/segmentedControl/SegmentedControl'
import { t } from '../../../core/i18n'
import type { CollectionItem } from '../../../core/services/photoPost'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { useTabletLayout } from '../../hooks/useTabletLayout'
import { usePanelHandoff } from '../../hooks/usePanelHandoff'
import { SCREENS } from '../../navigation/navigation.types'
import { PanelActions } from '../../components/PanelActions'

const ListHeader = () => <Spacer height={8} />
const ListFooter = () => <Spacer height={80} />

const keyExtractor = (item: CollectionItem) => item.cid

const DIALOG_WIDTH = 360
/** The delete dialog keeps at least this much from the window's sides when the window is narrow. */
const DIALOG_MARGIN = 16

export const CollectionScreen = observer(() => {
  const vm = useVM(CollectionVM)
  const { panel } = vm
  usePanelHandoff(SCREENS.PHOTO_HISTORY, panel, vm.showPhoto)
  const tabBarHeight = useBottomTabBarHeight()
  const { colors } = useTheme()
  const navigation = useNavigation()
  const layout = useTabletLayout()
  const dialogWidth = Math.min(DIALOG_WIDTH, layout.width - 2 * DIALOG_MARGIN)
  useFocusEffect(
    useCallback(() => {
      vm.getPhotos()
    }, [vm]),
  )
  useLayoutEffect(() => {
    if (!panel.postInfo) return
    // Taken now: the post is cleared when another photo is picked, and the header may draw meanwhile.
    const { cid, title, desc } = panel.postInfo
    const post = { cid, title, desc }
    navigation.setOptions({
      // The header stays while then-and-now covers the post, so in compare mode the buttons that
      // belong to the post drop out. The row observes the panel itself; only another post has to
      // set it again.
      headerRight: () => (
        <PanelActions
          panel={panel}
          post={post}
          sharedWithCompare
          onToggleFavorite={vm.toggleFavorite}
          style={s.header}
        />
      ),
    })
  }, [panel, panel.postInfo, vm.toggleFavorite, navigation])

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
      {/* The photo's pane beside it takes its width from the window (see PhotoDetail). */}
      {/* Ends where the floating tab bar begins, so the rows scroll out of sight above it rather
          than showing around it. */}
      <View
        style={{
          width: layout.listWidth,
          marginLeft: layout.leftInset,
          marginBottom: tabBarHeight,
        }}>
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
          contentContainerStyle={s.listContent}
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
      <PhotoDetail
        panel={panel}
        onLinkPress={vm.openPhotoFromLink}
        onOpenPhoto={vm.showPhoto}
      />
      <Modal
        visible={vm.isDeleteModalVisible}
        transparent
        animationType="fade"
        // A modal is portrait-only by default on iOS, which would turn a landscape app around.
        supportedOrientations={['portrait', 'portrait-upside-down', 'landscape-left', 'landscape-right']}
        onRequestClose={vm.hideDeleteModal}>
        <Pressable style={s.overlay} onPress={vm.hideDeleteModal}>
          <View
            style={[s.modalContainer, { width: dialogWidth, backgroundColor: colors.baseSecond }]}>
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
  emptyContainer: { paddingTop: 16 },
  // 44 pt buttons around 24 pt glyphs: 6 keeps the glyphs 16 from the edge.
  header: { flexDirection: 'row', marginRight: 6 },
  segmentHeader: { paddingHorizontal: 16 },
  // 16 in from each side, in line with the floating tab bar under the list.
  list: { flex: 1, paddingHorizontal: 16 },
  listContent: { paddingBottom: 16 },
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
