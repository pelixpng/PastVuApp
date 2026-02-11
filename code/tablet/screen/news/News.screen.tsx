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
import { PhotoDetail } from '../collection/components/photoDetail/PhotoDetail'
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
    if (vm.selectedTab === 'photos' && vm.postInfo) {
      navigation.setOptions({
        headerRight: () => (
          <View style={s.header}>
            <MaterialIcons
              name={vm.isFavorite ? 'favorite' : 'favorite-border'}
              size={24}
              color={colors.textFirst}
              onPress={vm.toggleFavorite}
            />
            <Spacer width={24} />
            <MaterialIcons
              name="save-alt"
              size={24}
              color={colors.textFirst}
              onPress={vm.saveImage}
            />
            <Spacer width={24} />
            <MaterialIcons name="share" size={24} color={colors.textFirst} onPress={vm.share} />
          </View>
        ),
      })
    } else if (vm.selectedTab === 'posts' && vm.activePost) {
      navigation.setOptions({
        headerRight: () => (
          <View style={s.header}>
            <MaterialIcons name="share" size={24} color={colors.textFirst} />
          </View>
        ),
      })
    } else {
      navigation.setOptions({ headerRight: undefined })
    }
  }, [vm.selectedTab, vm.activePost, vm.postInfo, vm.isFavorite, colors.textFirst, navigation])

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
        {vm.selectedTab === 'posts' ? (
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
        ) : (
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
                isSelected={vm.selectedPhotoCid === item.cid}
                onPress={() => vm.showPhoto(item.cid)}
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
        )}
      </View>
      {vm.selectedTab === 'posts' ? (
        <NewsDetail
          post={vm.activePost}
          comments={vm.postComments}
          users={vm.postUsers}
          onLinkPress={vm.openPhotoFromLink}
        />
      ) : (
        <PhotoDetail
          postInfo={vm.postInfo}
          comments={vm.photoComments}
          users={vm.photoUsers}
          onImageLoaded={vm.onImageLoad}
          imageLink={vm.imageLink}
          isImageLoaded={vm.isImageLoaded}
          showLoader={vm.showLoader}
          openFullScreen={vm.openFullScreenImage}
          onLinkPress={vm.openPhotoFromLink}
        />
      )}
    </Container>
  )
})

const s = StyleSheet.create({
  header: { flexDirection: 'row', marginRight: 16 },
  list: { flex: 1 },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
})
