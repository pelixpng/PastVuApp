import { FC } from 'react'
import { Image, View, StyleSheet, useWindowDimensions } from 'react-native'
import { fitContainer, SnapbackZoom, useImageResolution } from 'react-native-zoom-toolkit-swipe'
import { Resolution } from '../../../../../core/services/photoPost'

interface ImageZoomProps {
  uri: string
  /** Known up front from the post data; skips measuring the remote image. */
  resolution?: Resolution
  openFullScreenImage: () => void
  onImageLoaded: () => void
}

const PREVIEW_HEIGHT_RATIO = 0.4

const Preview: FC<ImageZoomProps & { resolution: Resolution }> = ({
  uri,
  resolution,
  openFullScreenImage,
  onImageLoaded,
}) => {
  const { width, height } = useWindowDimensions()
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
  return (
    <View style={s.container}>
      <SnapbackZoom onTap={openFullScreenImage}>
        <Image
          source={{ uri }}
          style={previewSize}
          resizeMethod="scale"
          resizeMode="cover"
          onLayout={onImageLoaded}
        />
      </SnapbackZoom>
    </View>
  )
}

/** Fallback for posts that carry no dimensions: measure the remote image before laying it out. */
const MeasuredPreview: FC<ImageZoomProps> = props => {
  const { isFetching, resolution } = useImageResolution({ uri: props.uri })
  const { height } = useWindowDimensions()
  // ---------- Early return ----------
  if (isFetching || resolution === undefined) {
    return <View style={{ height: height * PREVIEW_HEIGHT_RATIO }} />
  }
  return <Preview {...props} resolution={resolution} />
}

export const ImageZoom: FC<ImageZoomProps> = props =>
  props.resolution ? (
    <Preview {...props} resolution={props.resolution} />
  ) : (
    <MeasuredPreview {...props} />
  )

const s = StyleSheet.create({
  container: {
    zIndex: 1,
    alignItems: 'center',
  },
})
