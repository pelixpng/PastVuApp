import { useTheme } from '@react-navigation/native'
import { FC, ReactNode } from 'react'
import { View, ScrollView, StyleSheet, StyleProp, ViewStyle } from 'react-native'

type ContainerProps = {
  isScroll?: boolean
  row?: boolean
  pdHorizontal?: number
  style?: StyleProp<ViewStyle>
  children?: ReactNode
}

export const Container: FC<ContainerProps> = ({ children, isScroll, row, pdHorizontal, style }) => {
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
    return <ScrollView style={containerStyle}>{children}</ScrollView>
  }

  return <View style={containerStyle}>{children}</View>
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
