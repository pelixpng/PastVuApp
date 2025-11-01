import { View, Image, Platform } from 'react-native'
import { SIZE } from '../../../constants/sizes'
import { fitContainer, ResumableZoom, useImageResolution } from 'react-native-zoom-toolkit-swipe'
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  useAnimatedReaction,
  runOnJS,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRef } from 'react'
import { MaterialIcons } from '@expo/vector-icons'
import { Spacer } from '../../../components/ui/Spacer'
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import { savePhoto, sharePhoto } from '../../../utils/getPhoto'
import { StackParamList } from '../../../navigation/stackParams.types'
import { SCREENS } from '../../../navigation/navigation.types'
import { s } from './style'

export const FullScreenImage = () => {
  const SWIPE_CLOSE_THRESHOLD = 125

  const navigation = useNavigation()
  const { params } = useRoute<RouteProp<StackParamList, typeof SCREENS.FULL_SCREEN_IMAGE>>()
  const { top } = useSafeAreaInsets()
  const paddingTop = top + (Platform.OS === 'android' ? 15 : 10)
  const { isFetching, resolution } = useImageResolution({
    uri: params.uri,
  })

  const translateY = useSharedValue(0)
  const isClosing = useSharedValue(false)
  const swipeTimeout = useRef<NodeJS.Timeout | null>(null)

  useAnimatedReaction(
    () => isClosing.value,
    closing => {
      if (closing) {
        runOnJS(navigation.goBack)()
      }
    },
    [navigation],
  )

  const animatedContent = useAnimatedStyle(() => {
    const opacity = interpolate(
      Math.abs(translateY.value),
      [0, SWIPE_CLOSE_THRESHOLD],
      [1, 0],
      Extrapolate.CLAMP,
    )
    return {
      transform: [{ translateY: translateY.value }],
      opacity,
    }
  })

  const animatedBackground = useAnimatedStyle(() => {
    const opacity = interpolate(
      Math.abs(translateY.value),
      [0, SWIPE_CLOSE_THRESHOLD],
      [1, 0],
      Extrapolate.CLAMP,
    )
    return {
      opacity,
    }
  })

  const handleSwipe = ({ y }: { y: number }) => {
    if (isClosing.value) return

    translateY.value = y

    if (y < -SWIPE_CLOSE_THRESHOLD) {
      clearSwipeTimeout()
      isClosing.value = true
      translateY.value = withTiming(-SIZE.WINDOW_HEIGHT, { duration: 150 })
      return
    }

    if (y > SWIPE_CLOSE_THRESHOLD) {
      clearSwipeTimeout()
      isClosing.value = true
      translateY.value = withTiming(SIZE.WINDOW_HEIGHT, { duration: 150 })
      return
    }

    resetSwipeTimeout()
  }

  const clearSwipeTimeout = () => {
    if (swipeTimeout.current) {
      clearTimeout(swipeTimeout.current)
      swipeTimeout.current = null
    }
  }

  const resetSwipeTimeout = () => {
    clearSwipeTimeout()
    swipeTimeout.current = setTimeout(() => {
      if (!isClosing.value) {
        translateY.value = withTiming(0, { duration: 200 })
      }
    }, 120)
  }

  if (isFetching || resolution === undefined) {
    return <View />
  }

  const containerFit = fitContainer(resolution.width / resolution.height, {
    width: SIZE.WINDOW_WIDTH,
    height: SIZE.WINDOW_HEIGHT,
  })

  return (
    <View>
      <Animated.View style={[s.background, animatedBackground]} />
      <Animated.View style={[s.content, animatedContent]}>
        <View style={[s.header, { paddingTop }]}>
          <MaterialIcons
            name="arrow-back"
            size={24}
            color="white"
            onPress={() => navigation.goBack()}
          />
          <View style={s.actionIcons}>
            <MaterialIcons
              name="save-alt"
              size={24}
              color="white"
              onPress={() => savePhoto(params.title, params.file)}
            />
            <Spacer width={24} />
            <MaterialIcons
              name="share"
              size={24}
              color="white"
              onPress={() => sharePhoto(params.title, params.cid)}
            />
          </View>
        </View>
        <ResumableZoom
          maxScale={5}
          onSwipeAtBaseZoom={handleSwipe}
          style={{
            alignSelf: 'baseline',
            marginTop: SIZE.SCREEN_HEIGHT / 2 - containerFit.height / 2,
          }}>
          <Image source={{ uri: params?.uri }} style={containerFit} resizeMethod="scale" />
        </ResumableZoom>
      </Animated.View>
    </View>
  )
}
