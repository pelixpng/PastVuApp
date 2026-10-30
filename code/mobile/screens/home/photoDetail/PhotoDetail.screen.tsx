import { ActivityIndicator, FlatList, StyleSheet, View, useWindowDimensions } from 'react-native'
import { observer } from 'mobx-react-lite'
import { Comment } from '../../../../core/components/comment/Comment'
import PhotoDetailVM from './PhotoDetail.vm'
import { IComment } from '../../../../core/types/apiPhotoComment'
import { Container } from '../../../../core/components/ui/Container'
import { useNavigation, useTheme } from '@react-navigation/native'
import { PostText } from '../../../../core/components/post/PostText'
import { Spacer } from '../../../../core/components/ui/Spacer'
import { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import { HeaderIconButton } from '../../../../core/components/ui/buttons/HeaderIconButton'
import { ImageZoom } from '../../../../core/components/photo/ImageZoom'
import { ColourReveal } from '../../../../core/components/colorize/ColourReveal'
import {
  TranslateButton,
  showsTranslateButton,
} from '../../../../core/components/translate/TranslateButton'
import { useVM } from '../../../../core/hooks/useVM'
import { t } from '../../../../core/i18n'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, { Easing, FadeIn, ZoomIn, ZoomOut } from 'react-native-reanimated'

export const PhotoDetailScreen = observer(() => {
  const vm = useVM(PhotoDetailVM)
  const { colorize } = vm
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()
  // The colour photo above the original is being zoomed and has to cover it.
  const [colourRaised, setColourRaised] = useState(false)
  const renderItem = useCallback(
    ({ item }: { item: IComment }) => (
      <Comment
        comment={item}
        users={vm.users}
        onLinkPress={vm.openPhotoFromLink}
        replyWidth="88%"
      />
    ),
    [],
  )
  const navigation = useNavigation()
  const { width } = useWindowDimensions()
  const showsCompareOriginal = colorize.isColorized && !colorize.isColorizing
  const showsPalette = colorize.isColorizing || colorize.canColorize
  const showsTranslate =
    !!vm.postInfo && showsTranslateButton(vm.postInfo.cid, vm.postInfo.title, vm.postInfo.desc)
  const gap = headerGap(
    width,
    HEADER_BUTTONS + Number(showsCompareOriginal) + Number(showsPalette) + Number(showsTranslate),
  )
  useLayoutEffect(() => {
    if (!vm.postInfo) return
    // Taken now: the post is cleared while the next one loads, and the header may draw meanwhile.
    const { cid, title, desc } = vm.postInfo
    navigation.setOptions({
      headerRight: () => (
        <View style={s.backIcon}>
          {/* Once coloured: the colour version above the black-and-white original. Grows in, so
              a button turning up in the header does not go unnoticed. */}
          {showsCompareOriginal && (
            <Animated.View style={{ marginRight: gap }} entering={BUTTON_IN} exiting={BUTTON_OUT}>
              <HeaderIconButton
                name="view-agenda"
                color={colorize.isComparingOriginal ? colors.basePrimary : colors.textFirst}
                onPress={colorize.toggleCompareOriginal}
                accessibilityLabel={
                  colorize.isComparingOriginal ? t('colorize.compareHide') : t('colorize.compare')
                }
              />
            </Animated.View>
          )}
          {/* Only on a title or description in a language other than the app's. */}
          <TranslateButton cid={cid} title={title} desc={desc} gap={gap} />
          {/* Colours the photo everywhere it shows, and back to the original on a second press.
              Only on black-and-white photos. Greyed out while colouring: the photo itself shows
              the progress. */}
          {colorize.isColorizing ? (
            <HeaderIconButton
              name="palette"
              color={colors.textThird}
              disabled
              accessibilityLabel={t('colorize.processing')}
            />
          ) : colorize.canColorize ? (
            <HeaderIconButton
              name="palette"
              color={colorize.isColorized ? colors.basePrimary : colors.textFirst}
              onPress={vm.toggleColorize}
              accessibilityLabel={
                colorize.isColorized ? t('colorize.original') : t('colorize.start')
              }
            />
          ) : null}
          {showsPalette && <Spacer width={gap} />}
          <HeaderIconButton name="compare" color={colors.textFirst} onPress={vm.openCompare} />
          <Spacer width={gap} />
          <HeaderIconButton
            name={vm.isFavorite ? 'favorite' : 'favorite-border'}
            color={colors.textFirst}
            onPress={vm.toggleFavorite}
          />
          <Spacer width={gap} />
          <HeaderIconButton name="save-alt" color={colors.textFirst} onPress={vm.saveImage} />
          <Spacer width={gap} />
          <HeaderIconButton name="share" color={colors.textFirst} onPress={vm.share} />
        </View>
      ),
    })
  }, [
    vm.postInfo,
    vm.isFavorite,
    colorize.isColorizing,
    colorize.isColorized,
    colorize.canColorize,
    colorize.isComparingOriginal,
    showsTranslate,
    gap,
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
        {colorize.isColorized && (
          <ColourReveal open={colorize.isComparingOriginal} raised={colourRaised}>
            <ImageZoom
              uri={colorize.displayLink}
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
          overlayUri={colorize.isColorized ? colorize.displayLink : undefined}
          overlayHidden={colorize.isComparingOriginal}
          colorizing={colorize.isColorizing}
          resolution={vm.imageResolution}
          openFullScreenImage={
            colorize.isComparingOriginal ? vm.openOriginalFullScreen : vm.openFullScreenImage
          }
          onImageLoaded={noop}
          onImageResolution={vm.onImageResolution}
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
            <PostText
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

/** Always in the header: compare, favourite, save and share. */
const HEADER_BUTTONS = 4
/** HeaderIconButton's touch target. */
const HEADER_BUTTON_SIZE = 44
/** The header row's right margin and the room the back button needs on the left. */
const HEADER_RESERVED = 6 + 56

/**
 * The space between header buttons: 4 pt, or less when that many do not fit beside the back
 * button. With the comparison with the original, translation and palette all shown there are
 * seven, which at 4 pt apart overrun a 375 pt wide phone.
 */
const headerGap = (width: number, buttons: number) =>
  Math.max(
    0,
    Math.min(4, (width - HEADER_RESERVED - buttons * HEADER_BUTTON_SIZE) / (buttons - 1)),
  )

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
})
