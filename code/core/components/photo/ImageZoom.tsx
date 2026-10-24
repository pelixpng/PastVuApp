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
   * A pinch begins and, after the photo springs back, ends. With two photos stacked the zoomed one
   * has to be raised, or it grows under its neighbour.
   */
  onZoomStart?: () => void
  onZoomEnd?: () => void
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
  onZoomStart,
  onZoomEnd,
}) => {
  // Not useWindowDimensions: on the iPad it kept the portrait size after the turn to landscape.
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
  const previewSize =
    containerFit.height > maxPreviewHeight
      ? {
          height: maxPreviewHeight,
          width: (maxPreviewHeight * containerFit.width) / containerFit.height,
        }
      : containerFit
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
      <SnapbackZoom onTap={openFullScreenImage} onPinchStart={onZoomStart} onGestureEnd={onZoomEnd}>
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
              onLoad={() => {
                setLoaded(true)
                opacity.value = withTiming(1, { duration: 220 })
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
        <PhotoUnavailable height={height * PREVIEW_HEIGHT_RATIO} onLayout={props.onImageLoaded} />
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
