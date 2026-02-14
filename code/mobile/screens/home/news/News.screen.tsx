import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native'
import { useTheme } from '@react-navigation/native'
import { observer } from 'mobx-react'
import { useCallback } from 'react'
import NewsVM, { NewsTab } from './News.vm'
import { useVM } from '../../../../core/hooks/useVM'
import { SegmentedControl } from '../../../../core/components/ui/segmentedControl/SegmentedControl'
import type { NewsItems } from '../../../../core/types/apiNews'
import type { CollectionItem } from '../collection/Collection.screen'
import { PhotoListItem } from '../collection/components/Item'
import { Spacer } from '../../../../core/components/ui/Spacer'
import { PostListItem } from './components/PostListItem/PostListItem'

const Separator8 = () => <Spacer height={8} />
const Separator16 = () => <Spacer height={16} />

export const NewsScreen = observer(() => {
  const vm = useVM(NewsVM)
  const { colors } = useTheme()

  const renderPost = useCallback(
    ({ item }: { item: NewsItems }) => (
      <PostListItem
        title={item.title}
        notice={item.notice}
        pdate={item.pdate}
        ccount={item.ccount}
        user={item.user}
        onPress={() => vm.openPost(item)}
      />
    ),
    [vm],
  )

  const renderPhoto = useCallback(
    ({ item }: { item: CollectionItem }) => (
      <PhotoListItem
        title={item.title}
        description={item.description}
        file={item.file}
        onPress={() => vm.openPhoto(item.cid, item.title)}
      />
    ),
    [vm],
  )

  return (
    <View style={[{ backgroundColor: colors.backgroundApp }, s.container]}>
      <Spacer height={18} />
      <SegmentedControl
        options={vm.segmentOptions}
        selectedValue={vm.selectedTab}
        onChange={value => vm.setSelectedTab(value as NewsTab)}
      />
      <View style={s.listContainer}>
        {vm.selectedTab === 'posts' ? (
          <FlatList<NewsItems>
            data={vm.news}
            ItemSeparatorComponent={Separator8}
            ListHeaderComponent={Separator16}
            keyExtractor={postKeyExtractor}
            renderItem={renderPost}
            initialNumToRender={10}
            maxToRenderPerBatch={5}
            windowSize={5}
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
        ) : (
          <FlatList<CollectionItem>
            data={vm.historyItems}
            ItemSeparatorComponent={Separator16}
            ListHeaderComponent={Separator16}
            keyExtractor={photoKeyExtractor}
            renderItem={renderPhoto}
            initialNumToRender={10}
            maxToRenderPerBatch={5}
            windowSize={5}
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
        )}
      </View>
    </View>
  )
})

const postKeyExtractor = (item: NewsItems) => item._id
const photoKeyExtractor = (item: CollectionItem) => item.cid.toString()

const s = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listContainer: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
})
