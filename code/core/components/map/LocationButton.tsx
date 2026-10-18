import { FC, memo } from 'react'
import { FontAwesome5 } from '../ui/icons'
import { StyleSheet, TouchableOpacity } from 'react-native'
import { useTheme } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type LocationButtonProps = {
	onPress: () => void
	isTablet?: boolean
	/**
	 * Placed by its parent instead of in the map's corner: the phone map stacks it under the
	 * nearby-photos button and moves both with the sheet.
	 */
	inline?: boolean
}

const GetLocationButton: FC<LocationButtonProps> = ({
	onPress,
	isTablet,
	inline
}) => {
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
				{ backgroundColor: colors.backgroundApp },
				!inline && [s.pinned, { bottom, right }]
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
		borderRadius: 100
	},
	pinned: { position: 'absolute' }
})

export const LocationButton = memo(GetLocationButton)
