import { useTheme } from '@react-navigation/native'
import { FC, ReactNode } from 'react'
import { View, ScrollView, StyleSheet } from 'react-native'

type ContainerProps = {
  isScroll?: boolean
  children?: ReactNode
}

export const Container: FC<ContainerProps> = ({ children, isScroll }) => {
  const { colors } = useTheme()
  if (isScroll) {
    return (
      <ScrollView style={[styles.container, { backgroundColor: colors.backgroundApp }]}>
        {children}
      </ScrollView>
    )
  }
  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundApp }]}>{children}</View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
