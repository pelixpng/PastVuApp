import { useTheme } from '@react-navigation/native'
import { FC, ReactNode } from 'react'
import {
  AccessibilityState,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'

type UICardProps = {
  children: ReactNode[] | ReactNode
  onPress?: () => void
  /** Read out by screen readers on a pressable card, e.g. which of several cards is selected. */
  accessibilityState?: AccessibilityState
}

export const UICard: FC<UICardProps> = ({ children, onPress, accessibilityState }) => {
  const { colors } = useTheme()
  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        accessibilityState={accessibilityState}
        style={[s.container, { backgroundColor: colors.baseSecond }]}>
        {children}
      </TouchableOpacity>
    )
  }
  return <View style={[s.container, { backgroundColor: colors.baseSecond }]}>{children}</View>
}

const s = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 16,
    ...Platform.select({
      android: {
        elevation: 4,
      },
      ios: {
        shadowColor: 'rgba(0, 0, 0, 0.12)',
        shadowOpacity: 1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 4 },
      },
    }),
  },
})
