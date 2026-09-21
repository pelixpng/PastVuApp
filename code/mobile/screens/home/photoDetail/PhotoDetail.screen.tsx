import { FlatList, StyleSheet, Text, View } from 'react-native'
import { observer } from 'mobx-react-lite'
import { Comment } from './components/comment/Comment'
import PhotoDetailVM from './PhotoDetail.vm'
import { IComment } from '../../../../core/types/apiPhotoComment'
import { Container } from '../../../../core/components/ui/Container'
import { useNavigation, useTheme } from '@react-navigation/native'
import { PostInfo } from './components/postInfo/PostInfo'
import { Spacer } from '../../../../core/components/ui/Spacer'
import { useCallback, useEffect, useLayoutEffect } from 'react'
import { HeaderIconButton } from '../../../../core/components/ui/buttons/HeaderIconButton'
import { ImageZoom } from './components/imageView/ImageZoom'
import { useVM } from '../../../../core/hooks/useVM'
import { t } from '../../../../core/i18n'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export const PhotoDetailScreen = observer(() => {
  const vm = useVM(PhotoDetailVM)
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()
  const renderItem = useCallback(
    ({ item }: { item: IComment }) => (
      <Comment comment={item} users={vm.users} onLinkPress={vm.openPhotoFromLink} />
    ),
    [],
  )
  const navigation = useNavigation()
  useLayoutEffect(() => {
    if (!vm.postInfo) return
    navigation.setOptions({
      headerRight: () => (
        <View style={s.backIcon}>
          <HeaderIconButton name="compare" color={colors.textFirst} onPress={vm.openCompare} />
          <Spacer width={4} />
          <HeaderIconButton
            name={vm.isFavorite ? 'favorite' : 'favorite-border'}
            color={colors.textFirst}
            onPress={vm.toggleFavorite}
          />
          <Spacer width={4} />
          <HeaderIconButton name="save-alt" color={colors.textFirst} onPress={vm.saveImage} />
          <Spacer width={4} />
          <HeaderIconButton name="share" color={colors.textFirst} onPress={vm.share} />
        </View>
      ),
    })
  }, [vm.postInfo, vm.isFavorite, colors.textFirst, navigation])

  useEffect(() => {
    return navigation.addListener('beforeRemove', e => {
      if (vm.canGoBack) {
        e.preventDefault()
        vm.goBackToPhoto()
      }
    })
  }, [navigation, vm.canGoBack])

  if (!vm.postInfo) {
    return (
      <Container>
        <Text style={[s.titleText, { color: colors.textFirst }]}>{t('common.loading')}</Text>
      </Container>
    )
  }
  return (
    <Container>
      <ImageZoom
        uri={vm.imageLink}
        resolution={vm.imageResolution}
        openFullScreenImage={vm.openFullScreenImage}
        onImageLoaded={vm.onImageLoad}
      />
      <Spacer height={16} />
      {/* Not gated on the image: ImageZoom only mounts its <Image> once it has resolved the remote
          dimensions, so tying the text to that hid the whole post until the image was ready -- and
          hid it forever when the image failed to resolve. */}
      <FlatList
        // The screen runs edge to edge, so the last comments ended up under the system navigation
        // buttons with no way to scroll past them.
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
        showsVerticalScrollIndicator={false}
        data={vm.comments}
        renderItem={renderItem}
        extraData={vm.users}
        ListHeaderComponent={<PostInfo postInfo={vm.postInfo} onLinkPress={vm.openPhotoFromLink} />}
        style={s.listStyle}
        keyExtractor={item => item.cid}
      />
    </Container>
  )
})

const s = StyleSheet.create({
  listStyle: { marginHorizontal: 16 },
  titleText: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '800',
  },
  backIcon: { flexDirection: 'row', marginRight: 6 },
})
