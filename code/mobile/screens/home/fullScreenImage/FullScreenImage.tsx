import { View, Image, Platform, Dimensions } from 'react-native'
import { fitContainer, ResumableZoom, useImageResolution } from 'react-native-zoom-toolkit'
import Animated, { SlideInUp, Easing, SlideOutUp } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ReactElement, useState } from 'react'
import { HeaderIconButton } from '../../../../core/components/ui/buttons/HeaderIconButton'
import { Spacer } from '../../../../core/components/ui/Spacer'
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import { StackParamList } from '../../../navigation/stackParams.types'
import { SCREENS } from '../../../navigation/navigation.types'
import { s } from './style'
import { saveLocalImage, savePhoto, sharePhoto } from '../../../../core/utils/getPhoto'
import { useSwipeToClose } from '../../../../core/hooks/useSwipeToClose'
import { useLightStatusBar } from '../../../../core/hooks/useLightStatusBar'
import type { Resolution } from '../../../../core/services/photoPost'

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
  const { width, height } = Dimensions.get('screen')
  const [visibleHeader, setVisibleHeader] = useState(true)
  const navigation = useNavigation()
  const { params } = useRoute<RouteProp<StackParamList, typeof SCREENS.FULL_SCREEN_IMAGE>>()
  const { top } = useSafeAreaInsets()
  const paddingTop = top + (Platform.OS === 'android' ? 15 : 10)

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
        {params.resolution ? (
          photo(params.resolution)
        ) : (
          <Measured uri={params.uri}>{photo}</Measured>
        )}
      </Animated.View>
    </View>
  )
}
