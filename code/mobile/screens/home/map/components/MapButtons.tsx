import { FC, useState } from 'react'
import { StyleSheet, TouchableOpacity } from 'react-native'
import { useTheme } from '@react-navigation/native'
import { observer } from 'mobx-react-lite'
import Animated, {
	Extrapolation,
	interpolate,
	SharedValue,
	useAnimatedReaction,
	useAnimatedStyle
} from 'react-native-reanimated'
import { scheduleOnRN } from 'react-native-worklets'
import { MaterialIcons } from '../../../../../core/components/ui/icons'
import { LocationButton } from '../../../../../core/components/map/LocationButton'
import { Spacer } from '../../../../../core/components/ui/Spacer'
import { t } from '../../../../../core/i18n'

/** Bottom of the column with the sheet closed: clear of the years slider, as before the sheet. */
const BOTTOM = 103
/** Between the two buttons, and between the column and the sheet under it. */
const GAP = 12
/** How far the sheet is pulled past collapsed before the buttons are gone. */
const FADE_DISTANCE = 48

type MapButtonsProps = {
	/** How much of the nearby sheet shows above the bottom of the screen. */
	sheetHeight: SharedValue<number>
	collapsedHeight: number
	tabBarHeight: number
	nearbyOpen: boolean
	onToggleNearby: () => void
	onLocate: () => void
}

/**
 * The phone map's round buttons: nearby photos over my location. They ride on top of the nearby
 * sheet, and fade out as it is pulled up past collapsed, where they would run into the search field.
 */
export const MapButtons: FC<MapButtonsProps> = observer(
	({
		sheetHeight,
		collapsedHeight,
		tabBarHeight,
		nearbyOpen,
		onToggleNearby,
		onLocate
	}) => {
		const { colors } = useTheme()
		const [hidden, setHidden] = useState(false)

		useAnimatedReaction(
			() => sheetHeight.value > collapsedHeight + FADE_DISTANCE / 2,
			(now, before) => {
				if (now !== before) scheduleOnRN(setHidden, now)
			},
			[collapsedHeight]
		)

		const style = useAnimatedStyle(() => {
			const height = sheetHeight.value
			// The sheet is measured from the bottom of the screen, this column from the top of the tab
			// bar: it moves once the sheet's edge comes up to it.
			const lift = Math.max(0, height - tabBarHeight + GAP - BOTTOM)
			return {
				transform: [{ translateY: -lift }],
				opacity: interpolate(
					height,
					[collapsedHeight, collapsedHeight + FADE_DISTANCE],
					[1, 0],
					Extrapolation.CLAMP
				)
			}
		})

		return (
			<Animated.View
				style={[s.container, style]}
				pointerEvents={hidden ? 'none' : 'box-none'}
				accessibilityElementsHidden={hidden}
				importantForAccessibility={hidden ? 'no-hide-descendants' : 'auto'}
			>
				{/* Same look as LocationButton. */}
				<TouchableOpacity
					style={[s.button, { backgroundColor: colors.backgroundApp }]}
					onPress={onToggleNearby}
					accessibilityRole="button"
					accessibilityLabel={t('map.nearbyButton')}
					accessibilityState={{ expanded: nearbyOpen }}
				>
					<MaterialIcons
						name="photo-library"
						size={24}
						color={nearbyOpen ? colors.basePrimary : colors.textFirst}
					/>
				</TouchableOpacity>
				<Spacer height={GAP} />
				<LocationButton onPress={onLocate} inline />
			</Animated.View>
		)
	}
)

const s = StyleSheet.create({
	container: { position: 'absolute', right: 8, bottom: BOTTOM },
	button: { padding: 16, borderRadius: 100 }
})
