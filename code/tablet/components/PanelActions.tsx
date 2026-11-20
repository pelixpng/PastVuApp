import { FC } from 'react'
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native'
import { observer } from 'mobx-react-lite'
import { useTheme } from '@react-navigation/native'
import { HeaderIconButton } from '../../core/components/ui/buttons/HeaderIconButton'
import { Spacer } from '../../core/components/ui/Spacer'
import {
	ColorizeButtons,
	colorizeButtonCount
} from '../../core/components/colorize/ColorizeButtons'
import {
	TranslateButton,
	showsTranslateButton
} from '../../core/components/translate/TranslateButton'
import { PhotoPanel } from '../../core/store/PhotoPanel'
import { HEADER_BUTTONS, HEADER_GAP, headerGap } from '../../core/utils/headerGap'

/** What the translate button works on: the photo's title and description. */
export type PanelActionsPost = {
	cid: string | number
	title: string
	desc?: string | null
}

export type PanelActionsProps = {
	panel: PhotoPanel
	/**
	 * The photo the translate button works on; without one there is no translate button. Taken
	 * from the caller rather than read from the panel, which clears its post while the next photo
	 * loads: a navigator header kept from the previous photo keeps all its buttons meanwhile.
	 */
	post: PanelActionsPost | null | undefined
	/**
	 * The row stays in place while then-and-now covers the post, as a screen's navigator header
	 * does. In compare mode it then leaves out translation and the comparison with the original,
	 * which belong to the post. Off for a row inside the post, which then-and-now covers with it.
	 */
	sharedWithCompare?: boolean
	/** In place of the panel's own toggle, for a screen whose list shows the favourites. */
	onToggleFavorite?: () => void
	/**
	 * The room the row may take. The space between the buttons shrinks from 4 pt towards 0 so
	 * that all of them fit (see headerGap), counted from what is shown at the moment. Without it
	 * the buttons are 4 pt apart.
	 */
	width?: number
	/** Placement in the caller's header, e.g. the margin from the screen edge. */
	style?: StyleProp<ViewStyle>
}

/**
 * The actions on the photo in a tablet panel, in one row of 44 pt buttons: translate (only for a
 * title or description in another language), the colour buttons, then-and-now, favourite, save
 * and share. Used in the map panel's own header and in the navigator headers of the collection,
 * news and profile screens. An observer: the buttons follow the panel, the colour version and the
 * translation as they change.
 */
export const PanelActions: FC<PanelActionsProps> = observer(
	({ panel, post, sharedWithCompare = false, onToggleFavorite, width, style }) => {
		const { colors } = useTheme()
		const comparing = sharedWithCompare && !!panel.compareMode
		const forPost = !comparing
		const translates = !!post && forPost
		// Counted only when it is needed: the count reads the translation's state as well.
		const spacing =
			width === undefined
				? HEADER_GAP
				: headerGap(
						width,
						HEADER_BUTTONS +
							Number(translates && showsTranslateButton(post.cid, post.title, post.desc)) +
							colorizeButtonCount(panel.colorize, forPost),
						0
					)
		return (
			<View style={[s.row, style]}>
				{translates && (
					<TranslateButton cid={post.cid} title={post.title} desc={post.desc} gap={spacing} />
				)}
				<ColorizeButtons colorize={panel.colorize} showCompareOriginal={forPost} gap={spacing} />
				{/* While then-and-now covers the post, the button that opened it closes it, in the same
				    place: then-and-now has no close button of its own under a navigator header. */}
				<HeaderIconButton
					name={comparing ? 'close' : 'compare'}
					color={colors.textFirst}
					onPress={comparing ? panel.closeCompare : panel.openCompare}
				/>
				<Spacer width={spacing} />
				<HeaderIconButton
					name={panel.isFavorite ? 'favorite' : 'favorite-border'}
					color={colors.textFirst}
					onPress={onToggleFavorite ?? panel.toggleFavorite}
				/>
				<Spacer width={spacing} />
				<HeaderIconButton name="save-alt" color={colors.textFirst} onPress={panel.saveImage} />
				<Spacer width={spacing} />
				<HeaderIconButton name="share" color={colors.textFirst} onPress={panel.share} />
			</View>
		)
	}
)

const s = StyleSheet.create({
	row: { flexDirection: 'row' }
})
