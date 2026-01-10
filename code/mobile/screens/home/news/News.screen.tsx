import { FlatList, StyleSheet, Text } from 'react-native'
import { useTheme } from '@react-navigation/native'
import { observer } from 'mobx-react'
import NewsVM, { NewsTab } from './News.vm'
import { useVM } from '../../../../core/hooks/useVM'
import { SegmentedControl } from '../../../../core/components/ui/segmentedControl/SegmentedControl'
import { MenuButton } from '../../../../core/components/ui/buttons/menuButton/MenuButton'

export const NewsScreen = observer(() => {
  const vm = useVM(NewsVM)
  const { colors } = useTheme()

  return (
    <FlatList
      data={vm.displayedData}
      style={[{ backgroundColor: colors.backgroundApp }, s.container]}
      keyExtractor={(_, index) => index.toString()}
      ListHeaderComponent={
        <SegmentedControl
          options={vm.segmentOptions}
          selectedValue={vm.selectedTab}
          onChange={value => vm.setSelectedTab(value as NewsTab)}
        />
      }
      renderItem={({ item }) => <Text>{item}</Text>}
      ListEmptyComponent={
        <MenuButton
          title={vm.selectedTab === 'posts' ? 'Посты' : 'Фото'}
          description={
            vm.selectedTab === 'posts'
              ? 'Здесь будут отображаться посты'
              : 'Здесь будут отображаться фотографии'
          }
          icon={'history'}
        />
      }
    />
  )
})

const s = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
})
