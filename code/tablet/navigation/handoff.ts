import { InitialState, NavigationContainerRef, ParamListBase } from '@react-navigation/native'
import { RefObject } from 'react'
import { HandoffState, UiHandoff, profilePanelKey } from '../../core/store/UiHandoff'
import { SCREENS } from './navigation.types'

/**
 * Where the tablet interface is, for the phone interface replacing it (see core/store/UiHandoff):
 * the tab, and the photo its screen shows in the panel. A profile open over the tabs goes instead,
 * with the photo in its own pane.
 */
export const captureTabletState = (
	navigation: RefObject<NavigationContainerRef<ParamListBase> | null>
): HandoffState | null => {
	const root = navigation.current?.getRootState()
	if (!root) return null
	const tabs = root.routes.find(route => route.name === SCREENS.BOTTOM_TAB_NAVIGATOR)?.state
	const tab = tabs?.routes[tabs.index ?? 0]?.name ?? SCREENS.MAP
	const profile = root.routes
		.slice(0, root.index + 1)
		.reverse()
		.find(route => route.name === SCREENS.PROFILE)
	if (profile) {
		const { login } = profile.params as { login: string }
		const photo = UiHandoff.panelPhoto(profilePanelKey(profile.key))
		return { tab, photo: null, profile: { login, photo } }
	}
	return { tab, photo: UiHandoff.panelPhoto(tab) }
}

/**
 * The tablet's navigation to start from after the phone interface: the same tab, and the profile
 * open over it. The photo is opened by the screen in front, in its panel (see UiHandoff.takePhoto
 * and takeProfilePhoto).
 */
export const tabletInitialState = (): InitialState | undefined => {
	const handoff = UiHandoff.peek()
	if (!handoff) return undefined
	const tabs = {
		name: SCREENS.BOTTOM_TAB_NAVIGATOR,
		state: { routes: [{ name: handoff.tab }] }
	}
	const { profile } = handoff
	return {
		routes: profile
			? [tabs, { name: SCREENS.PROFILE, params: { login: profile.login } }]
			: [tabs]
	}
}
