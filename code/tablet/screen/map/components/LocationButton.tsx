import { FC, memo } from 'react'
import FontAwesome5 from '@expo/vector-icons/FontAwesome5'
import { StyleSheet, TouchableOpacity } from 'react-native'
import { useTheme } from '@react-navigation/native'

type LocationButtonProps = {
  onPress: () => void
}

const GetLocationButton: FC<LocationButtonProps> = ({ onPress }) => {
  const { colors } = useTheme()
  return (
    <TouchableOpacity
      style={[s.container, { backgroundColor: colors.backgroundApp }]}
      onPress={onPress}>
      <FontAwesome5 name="location-arrow" size={24} color={colors.textFirst} />
    </TouchableOpacity>
  )
}

const s = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 100,
    position: 'absolute',
    bottom: 24,
    right: 8,
  },
})

export const LocationButton = memo(GetLocationButton)
