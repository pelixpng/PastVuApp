import { StyleProp, StyleSheet, ViewStyle } from 'react-native'
import { TabletLayout } from '../../../hooks/useTabletLayout'

const s = StyleSheet.create({
	// A full window gives the details room for a wider right margin, which keeps the cards clear of
	// the screen's edge.
	regular: { paddingLeft: 32, paddingRight: 48 },
	// A narrower window spends as little of the details' width on margins as it can. Left and right
	// rather than paddingHorizontal: Container sets its own paddingHorizontal after this style.
	medium: { paddingLeft: 24, paddingRight: 24 }
})

/**
 * The narrowest content that takes the paired link buttons side by side. The longest paired label
 * (the French GitHub link) is about 282 pt at the buttons' 14 pt heavy, so at MyButton's smallest
 * scale, 0.75, it needs 212 pt; with the buttons' 12 pt padding on each side, the 12 pt gap
 * between them and the card's 16 pt padding, the content has to be about 515 pt for every label to
 * stay whole. Some margin is added for differences in font metrics. It stays below the 538 pt that
 * the narrowest `regular` window (970 pt) leaves, so every such window keeps the buttons side by
 * side.
 */
const WIDE_MIN_CONTENT = 530

export type SettingsDetailsLayout = {
	/** The details' side margins, a registered style. */
	padding: StyleProp<ViewStyle>
	/**
	 * Paired link buttons side by side. Narrower content stacks them at the card's full width, so
	 * labels that must stay word for word are not cut off.
	 */
	wide: boolean
}

/** How the settings details beside the menu lay out for the window's pane sizes. */
export const settingsDetailsLayout = (layout: TabletLayout): SettingsDetailsLayout => {
	const padding = layout.tier === 'regular' ? s.regular : s.medium
	const content = layout.width - layout.menuWidth - padding.paddingLeft - padding.paddingRight
	return { padding, wide: content >= WIDE_MIN_CONTENT }
}
