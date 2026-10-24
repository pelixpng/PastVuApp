import { FC } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { useTheme } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { observer } from 'mobx-react-lite'
import { MaterialIcons } from '../../../../../core/components/ui/icons'
import { LocationButton } from '../../../../../core/components/map/LocationButton'
import { Spacer } from '../../../../../core/components/ui/Spacer'
import { t } from '../../../../../core/i18n'
import { refreshWindowRegion } from '../../../../../modules/window-region'

/** Between the two buttons, as on the phone. */
const GAP = 12

type MapButtonsProps = {
	nearbyOpen: boolean
	onToggleNearby: () => void
	onLocate: () => void
}

/**
 * The tablet map's round buttons in the bottom-right corner: nearby photos over my location. They
 * stand where the location button stood alone, and a photo's panel covers them as it covered it.
 */
export const MapButtons: FC<MapButtonsProps> = observer(
	({ nearbyOpen, onToggleNearby, onLocate }) => {
		const { colors } = useTheme()
		const { bottom } = useSafeAreaInsets()
		return (
			<View
				// LocationButton's own tablet place: clear of the navigation bar, 16 from the edge like the
				// search field and the slider.
				style={[s.container, { bottom: 24 + bottom }]}
				pointerEvents="box-none"
				// A new view over Google Maps on Android: the window's transparent region is gathered again
				// with it, or the map could show through the button (see modules/window-region).
				onLayout={refreshWindowRegion}
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
			</View>
		)
	}
)

const s = StyleSheet.create({
	container: { position: 'absolute', right: 16 },
	button: { padding: 16, borderRadius: 100 }
})
