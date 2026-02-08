import { FC, useEffect } from 'react'
import { Modal, Text, TouchableOpacity, StyleSheet, Pressable } from 'react-native'
import { useTheme } from '@react-navigation/native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated'
import { Spacer } from '../Spacer'

export interface ConfirmationSheetProps {
  visible: boolean
  title: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
}

export const ConfirmationSheet: FC<ConfirmationSheetProps> = ({
  visible,
  title,
  confirmText = 'Удалить',
  cancelText = 'Отменить',
  onConfirm,
  onCancel,
}) => {
  const { colors } = useTheme()
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
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <Animated.View style={[s.overlay, overlayStyle]}>
        <Pressable style={s.overlayPressable} onPress={handleClose} />
        <Animated.View
          style={[s.container, { backgroundColor: colors.baseSecond }, containerStyle]}>
          <Text style={[s.title, { color: colors.textThird }]}>{title}</Text>
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
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  overlayPressable: {
    flex: 1,
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 16,
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
