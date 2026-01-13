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
        keyExtractor={item => item._id || item.cid}
        renderItem={({ item }) => (
          <View style={{ padding: 16 }}>
            <Text style={{ fontSize: 16, color: colors.text, fontWeight: 'bold' }}>
              {item.title}
            </Text>
            {item.rs && (
              <Text style={{ fontSize: 12, color: colors.text, opacity: 0.6, marginTop: 4 }}>
                {vm.getRegionPath(item.rs)}
              </Text>
            )}
            {item.year && (
              <Text style={{ fontSize: 12, color: colors.text, opacity: 0.6, marginTop: 2 }}>
                {item.year}
              </Text>
            )}
          </View>
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
