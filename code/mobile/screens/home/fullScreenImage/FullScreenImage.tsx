import { View, Image, Platform, Dimensions } from 'react-native'
import {
  fitContainer,
  ResumableZoom,
  useImageResolution,
  type ResumableZoomRefType,
} from 'react-native-zoom-toolkit'
import Animated, { SlideInUp, Easing, SlideOutUp } from 'react-native-reanimated'
import { useSafeAreaFrame, useSafeAreaInsets } from 'react-native-safe-area-context'
import { ReactElement, useLayoutEffect, useRef, useState } from 'react'
import { HeaderIconButton } from '../../../../core/components/ui/buttons/HeaderIconButton'
import { Spacer } from '../../../../core/components/ui/Spacer'
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import { StackParamList } from '../../../navigation/stackParams.types'
import { SCREENS } from '../../../navigation/navigation.types'
import { s } from './style'
import { saveLocalImage, savePhoto, sharePhoto } from '../../../../core/utils/getPhoto'
import { useSwipeToClose } from '../../../../core/hooks/useSwipeToClose'
import { useLightStatusBar } from '../../../../core/hooks/useLightStatusBar'
import { cameraBesideTop, topLevelWith } from '../../../../core/utils/sideCamera'
import type { Resolution } from '../../../../core/services/photoPost'

/** The header's buttons, 44 pt boxes, and the room above them under the top inset. */
const BUTTON_SIZE = 44
const BUTTON_TOP = Platform.OS === 'android' ? 15 : 10
/** Between the header's last button and a camera beside it. */
const CAMERA_GAP = 8

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
  // On Android the edge-to-edge root view: like the screen it runs under the navigation bar, and
  // unlike it, it is the window's when split-screen gives the phone's interface a part of a
  // tablet's or an unfolded screen (App.tsx). The screen's size would crop the photo there.
  const frame = useSafeAreaFrame()
  const { width, height } = Platform.OS === 'android' ? frame : Dimensions.get('screen')
  const [visibleHeader, setVisibleHeader] = useState(true)
  const navigation = useNavigation()
  const { params } = useRoute<RouteProp<StackParamList, typeof SCREENS.FULL_SCREEN_IMAGE>>()
  const insets = useSafeAreaInsets()
  const { top } = insets
  // On iPhone Duo's cover display the camera is in the top-right corner, below the top inset: the
  // header stands level with it, its buttons ending before it (see core/utils/sideCamera).
  const camera = cameraBesideTop([], insets, width, BUTTON_TOP + BUTTON_SIZE)
  const paddingTop = camera ? topLevelWith(camera, BUTTON_SIZE, top) : top + BUTTON_TOP
  const zoom = useRef<ResumableZoomRefType>(null)

  // A resized window refits the photo, as the tablet's full-screen photo does on a turn, but
  // ResumableZoom keeps the scale and offset set against the old size: a zoomed photo panned to an
  // edge would end up off-centre, with black beside it. Back to base zoom, without animation (see
  // tablet/screen/fullScreenImage). On mount the zoom is already at its base.
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
        maxScale={5}
        {...zoomCallbacks}
        onTap={() => setVisibleHeader(!visibleHeader)}
        style={{
          alignSelf: 'baseline',
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
      <Animated.View style={[s.background, { width, height }, backgroundStyle]} />
      <Animated.View style={[{ height }, contentStyle]}>
        {visibleHeader && (
          <Animated.View
            entering={SlideInUp.duration(600).easing(Easing.out(Easing.quad))}
            exiting={SlideOutUp.duration(600).easing(Easing.in(Easing.quad))}
            style={[
              s.header,
              { paddingTop },
              camera && { paddingRight: width - camera.x + CAMERA_GAP },
            ]}>
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
