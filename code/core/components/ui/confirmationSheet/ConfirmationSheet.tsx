import { FC, useEffect } from 'react'
import { Modal, Text, TouchableOpacity, StyleSheet, Pressable } from 'react-native'
import { useTheme } from '@react-navigation/native'
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from 'react-native-reanimated'

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
        <Animated.View style={[s.container, { backgroundColor: colors.baseSecond }, containerStyle]}>
          <Text style={[s.title, { color: colors.textSecond }]}>{title}</Text>
          <TouchableOpacity
            style={[s.button, { borderColor: colors.baseThird }]}
            onPress={handleConfirm}
            activeOpacity={0.7}>
            <Text style={[s.confirmText, { color: colors.textFirst }]}>{confirmText}</Text>
          </TouchableOpacity>
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
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  overlayPressable: {
    flex: 1,
  },
  container: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 34,
    paddingTop: 24,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 8,
  },
  confirmText: {
    fontSize: 16,
  },
  cancelButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
})
