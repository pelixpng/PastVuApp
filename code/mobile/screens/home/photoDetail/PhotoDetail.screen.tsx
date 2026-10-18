import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native'
import { observer } from 'mobx-react-lite'
import { Comment } from './components/comment/Comment'
import PhotoDetailVM from './PhotoDetail.vm'
import { IComment } from '../../../../core/types/apiPhotoComment'
import { Container } from '../../../../core/components/ui/Container'
import { useNavigation, useTheme } from '@react-navigation/native'
import { PostInfo } from './components/postInfo/PostInfo'
import { Spacer } from '../../../../core/components/ui/Spacer'
import { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import { HeaderIconButton } from '../../../../core/components/ui/buttons/HeaderIconButton'
import { ImageZoom } from '../../../../core/components/photo/ImageZoom'
import { ColourReveal } from '../../../../core/components/colorize/ColourReveal'
import { useVM } from '../../../../core/hooks/useVM'
import { t } from '../../../../core/i18n'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, { Easing, FadeIn, ZoomIn, ZoomOut } from 'react-native-reanimated'

export const PhotoDetailScreen = observer(() => {
  const vm = useVM(PhotoDetailVM)
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()
  // The colour photo above the original is being zoomed and has to cover it.
  const [colourRaised, setColourRaised] = useState(false)
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
          {/* Once coloured: the colour version above the black-and-white original. Grows in, so
              a button turning up in the header does not go unnoticed. */}
          {vm.isColorized && !vm.isColorizing && (
            <Animated.View style={s.compareButton} entering={BUTTON_IN} exiting={BUTTON_OUT}>
              <HeaderIconButton
                name="view-agenda"
                color={vm.isComparingOriginal ? colors.basePrimary : colors.textFirst}
                onPress={vm.toggleCompareOriginal}
                accessibilityLabel={
                  vm.isComparingOriginal ? t('colorize.compareHide') : t('colorize.compare')
                }
              />
            </Animated.View>
          )}
          {/* Colours the photo everywhere it shows, and back to the original on a second press.
              Only on black-and-white photos. */}
          {vm.isColorizing ? (
            <View style={s.headerSpinner}>
              <ActivityIndicator color={colors.textFirst} />
            </View>
          ) : vm.canColorize ? (
            <HeaderIconButton
              name="palette"
              color={vm.isColorized ? colors.basePrimary : colors.textFirst}
              onPress={vm.toggleColorize}
              accessibilityLabel={vm.isColorized ? t('colorize.original') : t('colorize.start')}
            />
          ) : null}
          {(vm.isColorizing || vm.canColorize) && <Spacer width={4} />}
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
  }, [
    vm.postInfo,
    vm.isFavorite,
    vm.isColorizing,
    vm.isColorized,
    vm.canColorize,
    vm.isComparingOriginal,
    colors,
    navigation,
  ])

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
        {/* Late, so a post that is already cached does not flash it. */}
        <Animated.View style={s.loader} entering={LOADER_IN}>
          <ActivityIndicator
            color={colors.textFirst}
            accessibilityLabel={t('common.loading')}
          />
        </Animated.View>
      </Container>
    )
  }
  return (
    <Container>
      {/* Keyed by the photo: a post opened from nearby photos or a comment fades in, rather than
          the next one snapping into place. */}
      <Animated.View key={vm.postInfo.cid} style={s.flexOne} entering={POST_IN}>
        {vm.isColorized && (
          <ColourReveal open={vm.isComparingOriginal} raised={colourRaised}>
            <ImageZoom
              uri={vm.displayLink}
              resolution={vm.imageResolution}
              openFullScreenImage={vm.openFullScreenImage}
              onImageLoaded={noop}
              onZoomStart={() => setColourRaised(true)}
              onZoomEnd={() => setColourRaised(false)}
            />
          </ColourReveal>
        )}
        {/* The original, with the colour version laid over it once coloured. While compared the
            colour layer fades out here, as the colour photo now sits above. */}
        <ImageZoom
          uri={vm.imageLink}
          overlayUri={vm.isColorized ? vm.displayLink : undefined}
          overlayHidden={vm.isComparingOriginal}
          colorizing={vm.isColorizing}
          resolution={vm.imageResolution}
          openFullScreenImage={
            vm.isComparingOriginal ? vm.openOriginalFullScreen : vm.openFullScreenImage
          }
          onImageLoaded={vm.onImageLoad}
        />
        <Spacer height={16} />
        {/* Not gated on the image: ImageZoom only mounts its <Image> once it has resolved the remote
            dimensions, so tying the text to that hid the whole post until the image was ready -- and
            hid it forever when the image failed to resolve. */}
        <FlatList
          // The screen runs edge to edge, so the last comments ended up under the system navigation
          // buttons with no way to scroll past them.
          contentContainerStyle={[s.listContent, { paddingBottom: insets.bottom + 16 }]}
          showsVerticalScrollIndicator={false}
          data={vm.comments}
          renderItem={renderItem}
          extraData={vm.users}
          ListHeaderComponent={
            <PostInfo
              postInfo={vm.postInfo}
              onLinkPress={vm.openPhotoFromLink}
              onOpenPhoto={vm.openPhoto}
            />
          }
          keyExtractor={item => item.cid}
        />
      </Animated.View>
    </Container>
  )
})

const noop = () => {}

const BUTTON_IN = ZoomIn.duration(220).easing(Easing.out(Easing.cubic))
const POST_IN = FadeIn.duration(220).easing(Easing.out(Easing.cubic))
const LOADER_IN = FadeIn.delay(150).duration(200)
const BUTTON_OUT = ZoomOut.duration(160)

const s = StyleSheet.create({
  // Padding, not a margin on the list: the list clips at its edges, and the nearby photos row has
  // to run to the screen's.
  listContent: { paddingHorizontal: 16 },
  flexOne: { flex: 1 },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  backIcon: { flexDirection: 'row', marginRight: 6 },
  // The 4 pt gap to the palette, as between the other header buttons.
  compareButton: { marginRight: 4 },
  // The 44 pt box of a header button, so the row does not shift while the photo is being coloured.
  headerSpinner: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
})
