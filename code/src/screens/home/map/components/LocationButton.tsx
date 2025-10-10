import { FC, memo } from 'react'
import { MaterialIcons } from '@expo/vector-icons'
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
      <MaterialIcons name="my-location" size={24} color={colors.textFirst} />
    </TouchableOpacity>
  )
}

const s = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 100,
    position: 'absolute',
    bottom: 120,
    right: 16,
  },
})

export const LocationButton = memo(GetLocationButton)
