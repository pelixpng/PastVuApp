import { FC, memo } from 'react'
import { FontAwesome5 } from '../ui/icons'
import { StyleSheet, TouchableOpacity } from 'react-native'
import { useTheme } from '@react-navigation/native'

type LocationButtonProps = {
	onPress: () => void
}

/**
 * The map's "my location" button. Placed by its parent: both maps stack it under the
 * nearby-photos button, and the phone moves both with the sheet.
 */
const GetLocationButton: FC<LocationButtonProps> = ({ onPress }) => {
	const { colors } = useTheme()
	return (
		<TouchableOpacity
			style={[s.container, { backgroundColor: colors.backgroundApp }]}
			onPress={onPress}
		>
			<FontAwesome5 name="location-arrow" size={24} color={colors.textFirst} />
		</TouchableOpacity>
	)
}

const s = StyleSheet.create({
	container: {
		padding: 16,
		borderRadius: 100
	}
})

export const LocationButton = memo(GetLocationButton)
