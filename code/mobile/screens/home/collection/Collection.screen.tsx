import { useCallback } from 'react'
import { FlatList, StyleSheet, View } from 'react-native'
import { useFocusEffect, useTheme } from '@react-navigation/native'
import { observer } from 'mobx-react'
import CollectionVM, { CollectionTab } from './Collection.vm'
import { PhotoListItem } from './components/Item'
import { MenuButton } from '../../../../core/components/ui/buttons/menuButton/MenuButton'
import { Spacer } from '../../../../core/components/ui/Spacer'
import { useVM } from '../../../../core/hooks/useVM'
import { SegmentedControl } from '../../../../core/components/ui/segmentedControl/SegmentedControl'
import { ConfirmationSheet } from '../../../../core/components/ui/confirmationSheet/ConfirmationSheet'

export interface CollectionItem {
  title: string
  description: string
  cid: string
  file: string
}

const Separator = () => <Spacer height={16} />

const keyExtractor = (item: CollectionItem) => item.cid

export const CollectionScreen = observer(() => {
  const vm = useVM(CollectionVM)
  const { colors } = useTheme()
  useFocusEffect(
    useCallback(() => {
      vm.getPhotos()
    }, [vm]),
  )

  const renderItem = useCallback(
    ({ item }: { item: CollectionItem }) => (
      <PhotoListItem
        title={item.title}
        description={item.description}
        file={item.file}
        onPress={() => vm.openPhoto(item.cid, item.title)}
        onRemove={() => vm.showDeleteConfirmation(item.cid)}
      />
    ),
    [vm],
  )

  return (
    <View style={[{ backgroundColor: colors.backgroundApp }, s.container]}>
      <Spacer height={18} />
      <View style={s.padding}>
        <SegmentedControl
          options={vm.segmentOptions}
          selectedValue={vm.selectedTab}
          onChange={value => vm.setSelectedTab(value as CollectionTab)}
        />
        <Spacer height={16} />
      </View>
      <FlatList
        data={vm.displayedData}
        keyExtractor={keyExtractor}
        contentContainerStyle={s.padding}
        ItemSeparatorComponent={Separator}
        renderItem={renderItem}
        initialNumToRender={10}
        maxToRenderPerBatch={5}
        windowSize={5}
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
      <ConfirmationSheet
        visible={vm.isDeleteModalVisible}
        title={vm.deleteConfirmationTitle}
        onConfirm={vm.confirmDelete}
        onCancel={vm.hideDeleteConfirmation}
      />
    </View>
  )
})

const s = StyleSheet.create({
  container: { flex: 1 },
  padding: { paddingHorizontal: 16 },
})
