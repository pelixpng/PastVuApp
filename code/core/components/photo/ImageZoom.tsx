import { FC, useEffect, useState } from 'react'
import { ActivityIndicator, Image, View, StyleSheet } from 'react-native'
import { useTheme } from '@react-navigation/native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { fitContainer, SnapbackZoom, useImageResolution } from 'react-native-zoom-toolkit'
import { PhotoUnavailable } from '../ui/PhotoUnavailable'
import { Resolution } from '../../services/photoPost'
import { ColorizingOverlay } from '../colorize/ColorizingOverlay'
import { useRootSize } from '../../hooks/useRootSize'

interface ImageZoomProps {
  uri: string
  /**
   * A second picture laid over the first, the colour version over the original. Switching between
   * them only fades this layer: changing `uri` instead reloads the photo, which flickers.
   */
  overlayUri?: string
  overlayHidden?: boolean
  /** The colour version is being made: the photo dims under a spinner until it is ready. */
  colorizing?: boolean
  /** Known up front from the post data; skips measuring the remote image. */
  resolution?: Resolution
  openFullScreenImage: () => void
  onImageLoaded: () => void
  /**
   * The photo's size as it loaded, so full screen can show it without measuring it again. It may
   * come downscaled to fit the preview, but keeps the photo's proportions. With the link it loaded
   * from, so the size is not taken for another file.
   */
  onImageResolution?: (resolution: Resolution, uri: string) => void
  /**
   * A pinch begins and, after the photo springs back, ends. With two photos stacked the zoomed one
   * has to be raised, or it grows under its neighbour.
   */
  onZoomStart?: () => void
  onZoomEnd?: () => void
  /**
   * The widest the preview may be, for a photo laid out in a column narrower than the window, as in
   * the tablet's side panel. Fitted to the window alone, the photo would spill past the column and
   * the panel would clip its sides. Without it the preview fits the window.
   */
  maxWidth?: number
}

const PREVIEW_HEIGHT_RATIO = 0.4
/** As long as the colour photo takes to slide into its own place above. */
const OVERLAY_FADE_MS = 320

const Overlay: FC<{ uri: string; hidden: boolean }> = ({ uri, hidden }) => {
  const opacity = useSharedValue(hidden ? 0 : 1)
  useEffect(() => {
    opacity.value = withTiming(hidden ? 0 : 1, { duration: OVERLAY_FADE_MS })
  }, [hidden, opacity])
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }))
  return (
    <Animated.Image
      source={{ uri }}
      style={[StyleSheet.absoluteFill, style]}
      resizeMethod="scale"
      resizeMode="cover"
      fadeDuration={0}
    />
  )
}

const Preview: FC<ImageZoomProps & { resolution: Resolution }> = ({
  uri,
  overlayUri,
  overlayHidden = false,
  colorizing = false,
  resolution,
  openFullScreenImage,
  onImageLoaded,
  onImageResolution,
  onZoomStart,
  onZoomEnd,
  maxWidth,
}) => {
  // Not useWindowDimensions, which on iOS can keep the size from before a turn (see useRootSize).
  const { width, height } = useRootSize()
  const { colors } = useTheme()
  const [failed, setFailed] = useState(false)
  // A spinner holds the photo's place until it has loaded, then the photo fades in over it.
  const [loaded, setLoaded] = useState(false)
  const opacity = useSharedValue(0)
  const fadeIn = useAnimatedStyle(() => ({ opacity: opacity.value }))
  const maxPreviewHeight = height * PREVIEW_HEIGHT_RATIO
  // ---------- Image sizing ----------
  const containerFit = fitContainer(resolution.width / resolution.height, { width, height })
  const windowFit =
    containerFit.height > maxPreviewHeight
      ? {
          height: maxPreviewHeight,
          width: (maxPreviewHeight * containerFit.width) / containerFit.height,
        }
      : containerFit
  // Scaled down to the column only when the window's fit is wider than it: a photo that already
  // fits keeps exactly the size the window gives it, and the height cap above still holds.
  const widthLimit = maxWidth === undefined ? Infinity : Math.max(0, maxWidth)
  const previewSize =
    windowFit.width > widthLimit
      ? { width: widthLimit, height: (widthLimit * windowFit.height) / windowFit.width }
      : windowFit
  if (failed) {
    return (
      <View style={s.container}>
        <PhotoUnavailable
          width={previewSize.width}
          height={previewSize.height}
          onLayout={onImageLoaded}
        />
      </View>
    )
  }
  return (
    <View style={s.container}>
      {/* Keyed by the preview's size: SnapbackZoom pins its child to the size it measured at the
          first pinch, so after a turn or a resize the photo would keep the old size and sit off
          centre. The load state above survives, so the photo does not fade in again. */}
      <SnapbackZoom
        key={`${Math.round(previewSize.width)}x${Math.round(previewSize.height)}`}
        onTap={openFullScreenImage}
        onPinchStart={onZoomStart}
        onGestureEnd={onZoomEnd}>
        <View style={previewSize}>
          {!loaded && (
            <ActivityIndicator style={StyleSheet.absoluteFill} color={colors.textThird} />
          )}
          <Animated.View style={fadeIn}>
            <Image
              source={{ uri }}
              style={previewSize}
              resizeMethod="scale"
              resizeMode="cover"
              fadeDuration={0}
              onLayout={onImageLoaded}
              onLoad={e => {
                setLoaded(true)
                opacity.value = withTiming(1, { duration: 220 })
                const { source } = e.nativeEvent
                if (source.width > 0 && source.height > 0) {
                  onImageResolution?.({ width: source.width, height: source.height }, uri)
                }
              }}
              onError={() => setFailed(true)}
            />
          </Animated.View>
          {overlayUri && <Overlay uri={overlayUri} hidden={overlayHidden} />}
          {colorizing && <ColorizingOverlay />}
        </View>
      </SnapbackZoom>
    </View>
  )
}

/** Fallback for posts that carry no dimensions: measure the remote image before laying it out. */
const MeasuredPreview: FC<ImageZoomProps> = props => {
  const { isFetching, resolution, error } = useImageResolution({ uri: props.uri })
  const { height } = useRootSize()
  // ---------- Early return ----------
  // Measuring fetches the image, so a file the site no longer serves shows up here first.
  if (error) {
    return (
      <View style={s.container}>
        <PhotoUnavailable
          width={props.maxWidth}
          height={height * PREVIEW_HEIGHT_RATIO}
          onLayout={props.onImageLoaded}
        />
      </View>
    )
  }
  if (isFetching || resolution === undefined) {
    return <View style={{ height: height * PREVIEW_HEIGHT_RATIO }} />
  }
  return <Preview {...props} resolution={resolution} />
}

// Keyed by the image, so a failure on one photo does not stick to the next one shown in its place.
export const ImageZoom: FC<ImageZoomProps> = props =>
  props.resolution ? (
    <Preview key={props.uri} {...props} resolution={props.resolution} />
  ) : (
    <MeasuredPreview key={props.uri} {...props} />
  )

const s = StyleSheet.create({
  container: {
    zIndex: 1,
    alignItems: 'center',
  },
})
