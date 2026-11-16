/** A photo as both interfaces open it: the phone's photo screen takes its title for the header. */
export type HandoffPhoto = { cid: string; title: string }

/** A user's profile open over the tabs, with the photo open from it. */
export type HandoffProfile = { login: string; photo: HandoffPhoto | null }

/**
 * Where the interface going away was, for the one replacing it to open on: the tab, by its route
 * name, which the phone and the tablet share, the photo open on that tab, and a profile open over
 * it. With a profile the tab's photo, hidden under it, is not handed over.
 */
export type HandoffState = {
	tab: string
	photo: HandoffPhoto | null
	profile?: HandoffProfile | null
}

/** The key a phone photo screen tells its photo under (see UiHandoff.registerPanel). */
export const phonePhotoKey = (routeKey: string) => `photo:${routeKey}`

/** The key a tablet profile screen tells the photo in its pane under. */
export const profilePanelKey = (routeKey: string) => `profile:${routeKey}`

let pending: HandoffState | null = null
/**
 * What each screen shows, by a key of its own: a tablet screen's panel by its tab, as the tablet
 * keeps no route for it, and a phone photo screen by its route, which can show another photo than
 * its params say.
 */
const panelPhotos = new Map<string, () => HandoffPhoto | null>()

/** Forgets the hand-off once both its photo and its profile have been taken. */
const settle = () => {
	if (pending && !pending.photo && !pending.profile) pending = null
}

/**
 * Carries the user's place across a switch between the phone and the tablet interface, which on
 * iPhone Duo happens whenever the device folds or unfolds (see App.tsx). The two interfaces are
 * different trees with their own navigation and screen view models, so the tab, the open photo
 * and an open profile would be lost with the old tree. The map's years and markers live in
 * MapSession and MMKV, its camera in PhotoMap. Street View, then-and-now and scroll positions start
 * afresh.
 */
export const UiHandoff = {
	/** Kept by the interface going away, just before it unmounts; null when it has nothing to say. */
	put(state: HandoffState | null) {
		pending = state
	},

	/** For the incoming interface's navigator: the tab to start on, its photo and the profile. */
	peek(): HandoffState | null {
		return pending
	},

	/**
	 * For a tablet screen with a panel, once: the photo to open there, when the outgoing interface
	 * had one open on this tab. The first such screen to mount takes it, whichever tab it is on.
	 */
	takePhoto(tab: string): HandoffPhoto | null {
		const photo = pending?.tab === tab ? pending.photo : null
		if (pending) pending = { ...pending, photo: null }
		settle()
		return photo
	},

	/**
	 * For the tablet's profile screen, once: the photo to open in its pane, when the outgoing
	 * interface had one open from this profile. The tab's screen under it mounts first and leaves
	 * the profile's part alone.
	 */
	takeProfilePhoto(login: string): HandoffPhoto | null {
		const photo = pending?.profile?.login === login ? pending.profile.photo : null
		if (pending) pending = { ...pending, profile: null }
		settle()
		return photo
	},

	/** Forgets the hand-off once the phone's navigator has started from it. */
	clear() {
		pending = null
	},

	/**
	 * Lets a screen say what photo it shows, read when its interface goes away. Returns the
	 * function that takes it back, for when the screen unmounts.
	 */
	registerPanel(key: string, photo: () => HandoffPhoto | null) {
		panelPhotos.set(key, photo)
		return () => {
			if (panelPhotos.get(key) === photo) panelPhotos.delete(key)
		}
	},

	/** The photo the screen registered under `key` shows, if any. */
	panelPhoto(key: string): HandoffPhoto | null {
		return panelPhotos.get(key)?.() ?? null
	}
}
