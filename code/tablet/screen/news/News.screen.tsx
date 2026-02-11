import { useLayoutEffect } from 'react'
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native'
import { useNavigation, useTheme } from '@react-navigation/native'
import { observer } from 'mobx-react'
import { MaterialIcons } from '@expo/vector-icons'
import NewsVM, { NewsTab } from './News.vm'
import { useVM } from '../../../core/hooks/useVM'
import { Spacer } from '../../../core/components/ui/Spacer'
import { Container } from '../../../core/components/ui/Container'
import { SegmentedControl } from '../../../core/components/ui/segmentedControl/SegmentedControl'
import { PostListItem } from './components/postListItem/PostListItem'
import { NewsDetail } from './components/newsDetail/NewsDetail'
import { ItemHistory } from '../collection/components/itemHistory/Item'
import type { NewsItems } from '../../../core/types/apiNews'
import type { CollectionItem } from '../collection/Collection.screen'

export const NewsScreen = observer(() => {
  const vm = useVM(NewsVM)
  const { colors } = useTheme()
  const navigation = useNavigation()
  const { width } = useWindowDimensions()
  const listWidth = width * 0.33

  useLayoutEffect(() => {
    if (!vm.activePost) return
    navigation.setOptions({
      headerRight: () => (
        <View style={s.header}>
          <MaterialIcons name="share" size={24} color={colors.textFirst} />
        </View>
      ),
    })
  }, [vm.activePost, colors.textFirst, navigation])

  return (
    <Container row>
      <View style={{ width: listWidth }}>
        <Spacer height={18} />
        <View style={{ paddingHorizontal: 16 }}>
          <SegmentedControl
            options={vm.segmentOptions}
            selectedValue={vm.selectedTab}
            onChange={value => vm.setSelectedTab(value as NewsTab)}
          />
        </View>
        <View style={s.listContainer}>
          <View style={[s.listWrapper, vm.selectedTab === 'posts' ? s.listVisible : s.listHidden]}>
            <FlatList<NewsItems>
              data={vm.displayedPosts}
              style={s.list}
              ListHeaderComponent={() => <Spacer height={8} />}
              ListFooterComponent={<Spacer height={80} />}
              keyExtractor={item => item._id}
              renderItem={({ item }) => (
                <PostListItem
                  title={item.title}
                  notice={item.notice}
                  pdate={item.pdate}
                  ccount={item.ccount}
                  user={item.user}
                  isSelected={vm.selectedPostId === item._id}
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
          <View style={[s.listWrapper, vm.selectedTab === 'photos' ? s.listVisible : s.listHidden]}>
            <FlatList<CollectionItem>
              data={vm.displayedPhotos}
              style={s.list}
              ListHeaderComponent={() => <Spacer height={8} />}
              ListFooterComponent={<Spacer height={80} />}
              keyExtractor={item => item.cid}
              renderItem={({ item }) => (
                <ItemHistory
                  title={item.title}
                  description={item.description}
                  file={item.file}
                  onPress={() => vm.openPhoto(item.cid)}
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
      <NewsDetail
        post={vm.activePost}
        comments={vm.comments}
        users={vm.users}
        onLinkPress={vm.openPhotoFromLink}
      />
    </Container>
  )
})

const s = StyleSheet.create({
  header: { flexDirection: 'row', marginRight: 16 },
  list: { flex: 1 },
  listContainer: {
    flex: 1,
    position: 'relative',
  },
  listWrapper: {
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