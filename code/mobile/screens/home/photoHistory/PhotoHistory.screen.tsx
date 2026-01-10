import { useCallback } from 'react'
import { FlatList, StyleSheet, View } from 'react-native'
import { useFocusEffect, useTheme } from '@react-navigation/native'
import { observer } from 'mobx-react'
import PhotoHistoryVM, { CollectionTab } from './PhotoHistory.vm'
import { ItemHistory } from './components/Item'
import { MenuButton } from '../../../../core/components/ui/buttons/menuButton/MenuButton'
import { Spacer } from '../../../../core/components/ui/Spacer'
import { useVM } from '../../../../core/hooks/useVM'
import { SegmentedControl } from '../../../../core/components/ui/segmentedControl/SegmentedControl'

export interface HistoryItem {
  title: string
  description: string
  cid: string
  file: string
}

export const PhotoHistoryScreen = observer(() => {
  const vm = useVM(PhotoHistoryVM)
  const { colors } = useTheme()
  useFocusEffect(
    useCallback(() => {
      vm.getPhotos()
    }, [vm]),
  )

  return (
    <FlatList
      data={vm.displayedData}
      style={[{ backgroundColor: colors.backgroundApp }, s.container]}
      keyExtractor={item => item.cid}
      ListHeaderComponent={
        <View>
          <Spacer height={18} />
          <SegmentedControl
            options={vm.segmentOptions}
            selectedValue={vm.selectedTab}
            onChange={value => vm.setSelectedTab(value as CollectionTab)}
          />
          <Spacer height={18} />
        </View>
      }
      ItemSeparatorComponent={() => <Spacer height={16} />}
      renderItem={({ item }) => (
        <ItemHistory
          title={item.title}
          description={item.description}
          file={item.file}
          onPress={() => vm.openPhoto(item.cid, item.title)}
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
  )
})

const s = StyleSheet.create({
  container: { paddingHorizontal: 16 },
})
