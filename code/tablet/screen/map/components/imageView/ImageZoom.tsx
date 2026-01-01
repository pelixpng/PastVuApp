import { FC } from 'react'
import { Image, View, StyleSheet, useWindowDimensions } from 'react-native'
import { fitContainer, SnapbackZoom, useImageResolution } from 'react-native-zoom-toolkit-swipe'

interface ImageZoomProps {
  uri: string
  openFullScreenImage: () => void
  onImageLoaded: () => void
}

export const ImageZoom: FC<ImageZoomProps> = ({ uri, openFullScreenImage, onImageLoaded }) => {
  const { isFetching, resolution } = useImageResolution({ uri })
  const { width, height } = useWindowDimensions()
  const maxPreviewHeight = height * 0.6
  // ---------- Early return ----------
  if (isFetching || resolution === undefined) {
    return <View />
  }
  const containerFit = fitContainer(resolution.width / resolution.height, {
    width: width * 0.67 - 64,
    height: height,
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
    alignItems: 'center',
    zIndex: 20,
  },
})
