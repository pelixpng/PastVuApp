import { FC } from 'react'
import { Image, View, StyleSheet } from 'react-native'
import { fitContainer, SnapbackZoom, useImageResolution } from 'react-native-zoom-toolkit-swipe'
import { SIZE } from '../../../../../constants/sizes'

interface ImageZoomProps {
  uri: string
  openFullScreenImage: () => void
  onImageLoaded: () => void
}

export const ImageZoom: FC<ImageZoomProps> = ({ uri, openFullScreenImage, onImageLoaded }) => {
  const { isFetching, resolution } = useImageResolution({ uri })
  const maxPreviewHeight = SIZE.SCREEN_HEIGHT * 0.4
  // ---------- Early return ----------
  if (isFetching || resolution === undefined) {
    return <View style={s.preload} />
  }
  // ---------- Image sizing ----------
  const containerFit = fitContainer(resolution.width / resolution.height, {
    width: SIZE.WINDOW_WIDTH,
    height: SIZE.WINDOW_HEIGHT,
  })
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

const s = StyleSheet.create({
  container: {
    zIndex: 1,
    alignItems: 'center',
  },
  preload: { height: SIZE.SCREEN_HEIGHT * 0.4 },
})
