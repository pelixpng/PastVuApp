import { FC } from 'react'
import { ActivityIndicator, Platform, StyleSheet, Text } from 'react-native'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
import { Spacer } from '../ui/Spacer'
import { t } from '../../i18n'

/**
 * The longest a colouring takes, as measured: about 10 s on a Galaxy A54 and 22 s on a Helio G85
 * phone (ONNX Runtime on the CPU), a few seconds on iPhones (Core ML). The hint's wording in every
 * language fits both numbers ("секунд" for 5 and 30 alike), so check it when changing them.
 */
const MAX_SECONDS = Platform.OS === 'android' ? 30 : 5

/**
 * Laid over a photo while its colour version is being made: the photo dims, with a spinner and a
 * caption on it, and both fade so the colour version takes over smoothly. White on a dark veil, so
 * it reads in either theme.
 */
export const ColorizingOverlay: FC = () => (
  <Animated.View
    style={s.veil}
    entering={FadeIn.duration(200)}
    exiting={FadeOut.duration(250)}
    pointerEvents="none">
    <ActivityIndicator color="white" />
    <Spacer height={10} />
    <Text style={s.text}>{t('colorize.processing')}</Text>
    <Spacer height={2} />
    <Text style={s.hint}>{t('colorize.processingHint', { seconds: MAX_SECONDS })}</Text>
  </Animated.View>
)

const s = StyleSheet.create({
  veil: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    // The photo at about a third of its brightness, as on the old colorize screen.
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  text: { color: 'white', fontSize: 14, lineHeight: 20, fontWeight: '600' },
  hint: { color: 'rgba(255, 255, 255, 0.75)', fontSize: 12, lineHeight: 16, textAlign: 'center' },
})
