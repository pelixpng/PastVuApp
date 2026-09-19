import { FC, memo } from 'react'
import FontAwesome5 from '@expo/vector-icons/FontAwesome5'
import { StyleSheet, TouchableOpacity } from 'react-native'
import { useTheme } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type LocationButtonProps = {
	onPress: () => void
	isTablet?: boolean
}

const GetLocationButton: FC<LocationButtonProps> = ({ onPress, isTablet }) => {
	const { colors } = useTheme()
	const insets = useSafeAreaInsets()
	// On tablets the button sits close to the bottom edge, where the system navigation bar covered
	// it. The phone layout clears the bar via the tab bar above it, so it keeps its own offset.
	const bottom = isTablet ? 24 + insets.bottom : 103
	// 16 matches the inset the search field and the years slider use on tablets.
	const right = isTablet ? 16 : 8
	return (
		<TouchableOpacity
			style={[
				s.container,
				{ backgroundColor: colors.backgroundApp, bottom, right }
			]}
			onPress={onPress}
		>
			<FontAwesome5 name="location-arrow" size={24} color={colors.textFirst} />
		</TouchableOpacity>
	)
}

const s = StyleSheet.create({
	container: {
		padding: 16,
		borderRadius: 100,
		position: 'absolute'
	}
})

export const LocationButton = memo(GetLocationButton)
