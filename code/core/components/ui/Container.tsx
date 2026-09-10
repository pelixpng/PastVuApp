import { useTheme } from '@react-navigation/native'
import { FC, ReactNode } from 'react'
import { View, ScrollView, StyleSheet, StyleProp, ViewStyle } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type ContainerProps = {
  isScroll?: boolean
  row?: boolean
  pdHorizontal?: number
  style?: StyleProp<ViewStyle>
  children?: ReactNode
}

export const Container: FC<ContainerProps> = ({ children, isScroll, row, pdHorizontal, style }) => {
  const insets = useSafeAreaInsets()
  const { colors } = useTheme()

  const containerStyle: StyleProp<ViewStyle> = [
    style,
    styles.container,
    {
      backgroundColor: colors.backgroundApp,
      paddingHorizontal: pdHorizontal,
    },
    row ? { flexDirection: 'row' } : {},
  ]

  if (isScroll) {
    // Without this the content of a scrollable screen ends under the system navigation buttons,
    // with no way to scroll past them.
    return (
      <ScrollView
        style={containerStyle}
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}>
        {children}
      </ScrollView>
    )
  }

  return <View style={containerStyle}>{children}</View>
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
