import { FlatList, StyleSheet, Text, View } from 'react-native'
import { useTheme } from '@react-navigation/native'
import { observer } from 'mobx-react'
import NewsVM, { NewsTab } from './News.vm'
import { useVM } from '../../../../core/hooks/useVM'
import { SegmentedControl } from '../../../../core/components/ui/segmentedControl/SegmentedControl'

export const NewsScreen = observer(() => {
  const vm = useVM(NewsVM)
  const { colors } = useTheme()

  return (
    <View style={[{ backgroundColor: colors.backgroundApp }, s.container]}>
      <SegmentedControl
        options={vm.segmentOptions}
        selectedValue={vm.selectedTab}
        onChange={value => vm.setSelectedTab(value as NewsTab)}
      />
      <FlatList
        data={vm.displayedData}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <Text style={{ padding: 16, fontSize: 16, color: colors.text }}>{item.title}</Text>
        )}
        ListEmptyComponent={
          <Text style={{ padding: 16, color: colors.text }}>
            {vm.loading ? 'Загрузка новостей...' : 'Нет новостей'}
          </Text>
        }
      />
    </View>
  )
})

const s = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
})
