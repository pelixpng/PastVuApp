import { useEffect } from 'react'
import { PhotoPanel } from '../../core/store/PhotoPanel'
import { UiHandoff } from '../../core/store/UiHandoff'

/**
 * Carries the photo across a switch to and from the phone interface (see core/store/UiHandoff): on
 * mount opens the photo the phone had open on this tab, and from then on tells the hand-off what
 * the panel shows. `shown` says whether the panel is open at all, for a screen that hides it while
 * keeping its photo.
 */
export const usePanelHandoff = (
	tab: string,
	panel: PhotoPanel,
	open: (cid: string) => void,
	shown: () => boolean = () => true
) => {
	useEffect(() => {
		const photo = UiHandoff.takePhoto(tab)
		if (photo) open(photo.cid)
		return UiHandoff.registerPanel(tab, () =>
			shown() && panel.cid
				? { cid: panel.cid, title: panel.postInfo?.title ?? '' }
				: null
		)
		// Once per screen: the view model, its panel and its actions stay the same for its life.
	}, [])
}
