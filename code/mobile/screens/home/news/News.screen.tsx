import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native'
import { useTheme } from '@react-navigation/native'
import { observer } from 'mobx-react'
import NewsVM, { NewsTab } from './News.vm'
import { useVM } from '../../../../core/hooks/useVM'
import { SegmentedControl } from '../../../../core/components/ui/segmentedControl/SegmentedControl'
import type { NewsItems } from '../../../../core/types/apiNews'
import type { CollectionItem } from '../collection/Collection.screen'
import { PhotoListItem } from '../collection/components/Item'
import { Spacer } from '../../../../core/components/ui/Spacer'
import { PostListItem } from './components/PostListItem/PostListItem'

export const NewsScreen = observer(() => {
  const vm = useVM(NewsVM)
  const { colors } = useTheme()

  return (
    <View style={[{ backgroundColor: colors.backgroundApp }, s.container]}>
      <Spacer height={18} />
      <SegmentedControl
        options={vm.segmentOptions}
        selectedValue={vm.selectedTab}
        onChange={value => vm.setSelectedTab(value as NewsTab)}
      />
      <Spacer height={16} />
      <View style={s.listContainer}>
        <View style={[s.list, vm.selectedTab === 'posts' ? s.listVisible : s.listHidden]}>
          <FlatList<NewsItems>
            data={vm.news}
            ItemSeparatorComponent={() => <Spacer height={16} />}
            keyExtractor={item => item._id}
            renderItem={({ item }) => (
              <PostListItem
                title={item.title}
                notice={item.notice}
                pdate={item.pdate}
                ccount={item.ccount}
                user={item.user}
                onPress={() => vm.openPost(item)}
              />
            )}
            ListEmptyComponent={
              vm.loading ? (
                <View style={s.emptyContainer}>
                  <ActivityIndicator size="large" color="gray" />
                </View>
              ) : (
                <Text style={{ padding: 16, color: colors.text }}>Нет постов</Text>
              )
            }
          />
        </View>
        <View style={[s.list, vm.selectedTab === 'photos' ? s.listVisible : s.listHidden]}>
          <FlatList<CollectionItem>
            data={vm.historyItems}
            ItemSeparatorComponent={() => <Spacer height={16} />}
            keyExtractor={item => item.cid.toString()}
            renderItem={({ item }) => (
              <PhotoListItem
                title={item.title}
                description={item.description}
                file={item.file}
                onPress={() => vm.openPhoto(item.cid, item.title)}
              />
            )}
            ListEmptyComponent={
              vm.loading ? (
                <View style={s.emptyContainer}>
                  <ActivityIndicator size="large" color="gray" />
                </View>
              ) : (
                <Text style={{ padding: 16, color: colors.text }}>Нет фотографий</Text>
              )
            }
          />
        </View>
      </View>
    </View>
  )
})

const s = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listContainer: {
    flex: 1,
    position: 'relative',
  },
  list: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  listVisible: {
    zIndex: 1,
  },
  listHidden: {
    zIndex: 0,
    opacity: 0,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
})
