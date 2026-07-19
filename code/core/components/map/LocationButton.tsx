import { FC, memo } from 'react'
import FontAwesome5 from '@expo/vector-icons/FontAwesome5'
import { StyleSheet, TouchableOpacity } from 'react-native'
import { useTheme } from '@react-navigation/native'

type LocationButtonProps = {
  onPress: () => void
  isTablet?: boolean
}

const GetLocationButton: FC<LocationButtonProps> = ({ onPress, isTablet }) => {
  const { colors } = useTheme()
  return (
    <TouchableOpacity
      style={[s.container, { backgroundColor: colors.backgroundApp, bottom: isTablet ? 24 : 103 }]}
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
    right: 8,
  },
})

export const LocationButton = memo(GetLocationButton)
