import { View, Image, Platform } from 'react-native'
import {
  fitContainer,
  ResumableZoom,
  useImageResolution,
  type ResumableZoomRefType,
} from 'react-native-zoom-toolkit'
import Animated, { SlideInUp, Easing, SlideOutUp } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ReactElement, useLayoutEffect, useRef, useState } from 'react'
import { HeaderIconButton } from '../../../core/components/ui/buttons/HeaderIconButton'
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import { HEADER_SIDE, s } from './style'
import { StackParamList } from '../../navigation/stackParams.types'
import { SCREENS } from '../../navigation/navigation.types'
import { Spacer } from '../../../core/components/ui/Spacer'
import { saveLocalImage, savePhoto, sharePhoto } from '../../../core/utils/getPhoto'
import { useSwipeToClose } from '../../../core/hooks/useSwipeToClose'
import { useLightStatusBar } from '../../../core/hooks/useLightStatusBar'
import type { Resolution } from '../../../core/services/photoPost'
import { useTabletLayout } from '../../hooks/useTabletLayout'

/** Fallback for a photo opened without its size: measure it before laying it out. */
const Measured = ({
  uri,
  children,
}: {
  uri: string
  children: (resolution: Resolution) => ReactElement
}) => {
  const { isFetching, resolution } = useImageResolution({ uri })
  return isFetching || resolution === undefined ? null : children(resolution)
}

export const FullScreenImage = () => {
  const [visibleHeader, setVisibleHeader] = useState(true)
  const navigation = useNavigation()
  const { params } = useRoute<RouteProp<StackParamList, typeof SCREENS.FULL_SCREEN_IMAGE>>()
  const { top } = useSafeAreaInsets()
  // The root view's size, not Dimensions: see core/hooks/useRootSize.
  const { width, height, leftInset, rightInset } = useTabletLayout()
  const paddingTop = top + (Platform.OS === 'android' ? 15 : 10)
  // iPhone Duo unfolded on its side has a vertical bar with the status bar at one edge: the
  // buttons keep clear of it, while the header's shade runs under it to the edge.
  const headerSides = {
    paddingLeft: HEADER_SIDE + leftInset,
    paddingRight: HEADER_SIDE + rightInset,
  }
  const zoom = useRef<ResumableZoomRefType>(null)

  // A turn or a window resize refits the photo to the new frame, but ResumableZoom keeps its
  // scale and offset, which were set against the old size and would leave a zoomed photo cropped
  // and off-centre. Back to base zoom, the photo fits the new frame whole: right after the new
  // layout is committed, before the paint, and without animation. The reset itself reaches the UI
  // thread a moment later, so a frame of the old zoom at the new size can still show. On mount the
  // zoom is already at its base, so the first run changes nothing.
  useLayoutEffect(() => {
    zoom.current?.reset(false)
  }, [width, height])

  // The photo sits on black, so the status bar goes white whatever the theme.
  useLightStatusBar()

  // Telegram-style: at base zoom the photo follows a vertical swipe and closes past a threshold.
  const { contentStyle, backgroundStyle, zoomCallbacks } = useSwipeToClose(
    height,
    navigation.goBack,
  )

  const photo = (resolution: Resolution) => {
    const containerFit = fitContainer(resolution.width / resolution.height, {
      width,
      height,
    })
    return (
      <ResumableZoom
        ref={zoom}
        onTap={() => setVisibleHeader(!visibleHeader)}
        maxScale={5}
        {...zoomCallbacks}
        style={{
          alignSelf: 'center',
          marginTop: height / 2 - containerFit.height / 2,
        }}>
        <Image source={{ uri: params?.uri }} style={containerFit} resizeMethod="scale" />
      </ResumableZoom>
    )
  }

  // The background and the header show at once, even while the photo is measured or when that
  // fails, so the tap that opened the screen is answered and back is always there.
  return (
    <View>
      <Animated.View style={[s.background, backgroundStyle]} />
      <Animated.View style={[{ height }, contentStyle]}>
        {visibleHeader && (
          <Animated.View
            entering={SlideInUp.duration(600).easing(Easing.out(Easing.quad))}
            exiting={SlideOutUp.duration(600).easing(Easing.in(Easing.quad))}
            style={[s.header, { paddingTop }, headerSides]}>
            <HeaderIconButton name="arrow-back" color="white" onPress={() => navigation.goBack()} />
            <View style={s.actionIcons}>
              <HeaderIconButton
                name="save-alt"
                color="white"
                onPress={() =>
                  params.localFile
                    ? saveLocalImage(params.localFile)
                    : savePhoto(params.title, params.file)
                }
              />
              <Spacer width={4} />
              <HeaderIconButton
                name="share"
                color="white"
                onPress={() => sharePhoto(params.title, params.cid)}
              />
            </View>
          </Animated.View>
        )}
        {params.resolution ? (
          photo(params.resolution)
        ) : (
          <Measured uri={params.uri}>{photo}</Measured>
        )}
      </Animated.View>
    </View>
  )
}
