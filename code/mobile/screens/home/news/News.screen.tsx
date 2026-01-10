import { StyleSheet, View } from 'react-native'
import { useTheme } from '@react-navigation/native'

export const NewsScreen = () => {
  const { colors } = useTheme()
  return <View style={[{ backgroundColor: colors.backgroundApp }, s.container]} />
}

const s = StyleSheet.create({
  container: {
    flex: 1,
  },
})
