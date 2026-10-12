import { FC, useEffect } from 'react'
import { Linking, Modal, Text, TouchableOpacity, StyleSheet, Pressable } from 'react-native'
import { useTheme } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated'
import { Spacer } from '../Spacer'
import { t } from '../../../i18n'

export interface ConfirmationSheetProps {
  visible: boolean
  title: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  /** A link under the text, e.g. to the terms the user is agreeing to. */
  link?: { title: string; url: string }
}

export const ConfirmationSheet: FC<ConfirmationSheetProps> = ({
  visible,
  title,
  confirmText = t('common.delete'),
  cancelText = t('common.cancel'),
  onConfirm,
  onCancel,
  link,
}) => {
  const { colors } = useTheme()
  // The app runs edge to edge: without this the system navigation buttons cover Cancel.
  const { bottom } = useSafeAreaInsets()
  const translateY = useSharedValue(300)
  const opacity = useSharedValue(0)

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 200 })
      translateY.value = withTiming(0, { duration: 250 })
    }
  }, [visible, opacity, translateY])

  const handleClose = () => {
    opacity.value = withTiming(0, { duration: 200 })
    translateY.value = withTiming(300, { duration: 250 }, () => {
      runOnJS(onCancel)()
    })
  }

  const handleConfirm = () => {
    opacity.value = withTiming(0, { duration: 200 })
    translateY.value = withTiming(300, { duration: 250 }, () => {
      runOnJS(onConfirm)()
    })
  }

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }))

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }))

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      // A modal is portrait-only by default on iOS, which would turn the landscape iPad app around.
      supportedOrientations={['portrait', 'portrait-upside-down', 'landscape-left', 'landscape-right']}
      onRequestClose={handleClose}>
      <Animated.View style={[s.overlay, overlayStyle]}>
        <Pressable style={s.overlayPressable} onPress={handleClose} />
        <Animated.View
          style={[
            s.container,
            { backgroundColor: colors.baseSecond, paddingBottom: bottom + 16 },
            containerStyle,
          ]}>
          <Text style={[s.title, { color: colors.textThird }]}>{title}</Text>
          {link && (
            <TouchableOpacity
              style={s.link}
              onPress={() => Linking.openURL(link.url)}
              accessibilityRole="link"
              activeOpacity={0.7}>
              <Text style={[s.linkText, { color: colors.basePrimary }]}>{link.title}</Text>
            </TouchableOpacity>
          )}
          <Spacer height={17} />
          <TouchableOpacity
            style={[s.button, { backgroundColor: colors.baseFourth }]}
            onPress={handleConfirm}
            activeOpacity={0.7}>
            <Text style={[s.confirmText, { color: colors.textFirst }]}>{confirmText}</Text>
          </TouchableOpacity>
          <Spacer height={8} />
          <TouchableOpacity style={s.cancelButton} onPress={handleClose} activeOpacity={0.7}>
            <Text style={[s.cancelText, { color: colors.textFirst }]}>{cancelText}</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  )
}

const s = StyleSheet.create({
  link: { alignSelf: 'center', paddingTop: 10, paddingBottom: 2 },
  linkText: { fontSize: 13, fontWeight: '600', textAlign: 'center' },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  overlayPressable: {
    flex: 1,
  },
  // Full width on a phone; on the iPad a column of phone width, centred.
  container: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 29,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
  },
  button: {
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmText: {
    fontSize: 15,
    fontWeight: '800',
  },
  cancelButton: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '800',
  },
})
