import { View, Image, Platform } from 'react-native'
import { fitContainer, ResumableZoom, useImageResolution } from 'react-native-zoom-toolkit'
import Animated, { SlideInUp, Easing, SlideOutUp } from 'react-native-reanimated'
import { useSafeAreaFrame, useSafeAreaInsets } from 'react-native-safe-area-context'
import { useState } from 'react'
import { HeaderIconButton } from '../../../core/components/ui/buttons/HeaderIconButton'
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import { s } from './style'
import { StackParamList } from '../../navigation/stackParams.types'
import { SCREENS } from '../../navigation/navigation.types'
import { Spacer } from '../../../core/components/ui/Spacer'
import { saveLocalImage, savePhoto, sharePhoto } from '../../../core/utils/getPhoto'
import { useSwipeToClose } from '../../../core/hooks/useSwipeToClose'
import { useLightStatusBar } from '../../../core/hooks/useLightStatusBar'

export const FullScreenImage = () => {
  const [visibleHeader, setVisibleHeader] = useState(true)
  const navigation = useNavigation()
  const { params } = useRoute<RouteProp<StackParamList, typeof SCREENS.FULL_SCREEN_IMAGE>>()
  const { top } = useSafeAreaInsets()
  // The root view's size, not Dimensions: see core/hooks/useRootSize.
  const { width, height } = useSafeAreaFrame()
  const paddingTop = top + (Platform.OS === 'android' ? 15 : 10)
  const { isFetching, resolution } = useImageResolution({
    uri: params.uri,
  })

  // The photo sits on black, so the status bar goes white whatever the theme.
  useLightStatusBar()

  // Telegram-style: at base zoom the photo follows a vertical swipe and closes past a threshold.
  const { contentStyle, backgroundStyle, zoomCallbacks } = useSwipeToClose(
    height,
    navigation.goBack,
  )

  if (isFetching || resolution === undefined) {
    return <View />
  }

  const containerFit = fitContainer(resolution.width / resolution.height, {
    width,
    height,
  })

  return (
    <View>
      <Animated.View style={[s.background, backgroundStyle]} />
      <Animated.View style={[{ height }, contentStyle]}>
        {visibleHeader && (
          <Animated.View
            entering={SlideInUp.duration(600).easing(Easing.out(Easing.quad))}
            exiting={SlideOutUp.duration(600).easing(Easing.in(Easing.quad))}
            style={[s.header, { paddingTop }]}>
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
        <ResumableZoom
          onTap={() => setVisibleHeader(!visibleHeader)}
          maxScale={5}
          {...zoomCallbacks}
          style={{
            alignSelf: 'center',
            marginTop: height / 2 - containerFit.height / 2,
          }}>
          <Image source={{ uri: params?.uri }} style={containerFit} resizeMethod="scale" />
        </ResumableZoom>
      </Animated.View>
    </View>
  )
}
