import { action, computed, makeObservable, observable, runInAction } from 'mobx'
import { Alert } from 'react-native'
import ApiStore from './Api.store'
import { PostColorize } from './PostColorize'
import * as PhotoPost from '../services/photoPost'
import * as StreetView from '../services/streetView'
import type { CompareMode } from '../components/compare/CompareView'
import { IComment, Users } from '../types/apiPhotoComment'
import { saveLocalImage, savePhoto, sharePhoto } from '../utils/getPhoto'
import { t } from '../i18n'

type PhotoPanelOptions = {
	/** Opens the full-screen route, which belongs to the navigator of the screen holding the panel. */
	openFullScreen: (params: PhotoPost.FullScreenParams) => void
	/** The viewing history with the opened photo at its top, for a screen that lists it. */
	onHistory?: (history: PhotoPost.CollectionItem[]) => void
}

/**
 * The photo post in a tablet screen's right panel (the map, collection, news and profile): the
 * photo picked, its post and comments, Street View, then-and-now, the colour version, favourites,
 * saving and sharing. The screen keeps how photos are picked and where links lead.
 */
export class PhotoPanel {
	/** The photo picked; its post follows once loaded. */
	@observable cid: string | null = null
	@observable.ref postInfo: Photo | null = null
	@observable.ref comments: IComment[] = []
	@observable.ref users: Users | null = null
	@observable isImageLoaded = false
	@observable isFavorite = false
	@observable.ref streetView: StreetView.StreetViewInfo | null = null
	/** The panel shows the then-and-now view in place of the post, in this mode. */
	@observable compareMode: CompareMode | null = null

	/** The open photo's colour version: palette, colour photo, comparison with the original. */
	readonly colorize: PostColorize

	/**
	 * The preview's size once it has loaded, which full screen takes instead of measuring the photo
	 * again. From the loaded file, not the post data: a /h/ thumbnail is cut to its own proportions.
	 */
	private loadedResolution: {
		uri: string
		resolution: PhotoPost.Resolution
	} | null = null

	constructor(private readonly options: PhotoPanelOptions) {
		makeObservable(this)
		// After makeObservable, so it tracks the post.
		this.colorize = new PostColorize(
			() => (this.postInfo ? this.postInfo.cid.toString() : null),
			() => this.imageLink,
			() => this.postInfo?.file
		)
	}

	@computed
	get imageLink() {
		return `https://img.pastvu.com/${ApiStore.photoQualitySettings}/${this.postInfo?.file}`
	}

	/** Google confirmed a panorama, or could not be asked: either way the header offers it. */
	@computed
	get hasStreetView() {
		return this.streetView !== null && this.streetView.available !== false
	}

	@computed
	get comparePhoto() {
		return this.postInfo
			? {
					uri: this.colorize.displayLink,
					year: this.postInfo.y,
					...PhotoPost.photoResolution(this.postInfo)
				}
			: undefined
	}

	/** Opens the photo; the one already open loads again. */
	@action.bound
	show(cid: string) {
		this.cid = cid
		if (this.postInfo) this.clearPost()
		this.load(cid)
	}

	/** Opens the photo, unless its post is the one already shown. */
	@action.bound
	select(cid: string) {
		if (cid !== this.postInfo?.cid.toString()) this.show(cid)
	}

	@action.bound
	close() {
		this.cid = null
		this.clearPost()
	}

	private clearPost() {
		this.postInfo = null
		this.streetView = null
		this.compareMode = null
		this.comments = []
		this.users = null
		this.isImageLoaded = false
	}

	private async load(cid: string) {
		try {
			const { photo, users, comments, streetView } = await PhotoPost.loadPost(cid)
			// Another photo may have been opened, or the panel closed, while this request was in
			// flight; without this the slower, older response would overwrite the newer one.
			if (this.cid !== cid) return
			const history = PhotoPost.recordHistory(photo, cid)
			runInAction(() => {
				this.postInfo = photo
				this.users = users
				this.comments = comments
				this.isFavorite = PhotoPost.isFavorite(cid)
				this.options.onHistory?.(history)
			})
			this.checkStreetView(cid, streetView)
		} catch {
			Alert.alert(t('common.error'), t('photo.infoError'))
		}
	}

	/**
	 * Runs once the post is shown: the button appears when Google confirms a panorama. The question
	 * went out with the post, as soon as the photo brought its place.
	 */
	private async checkStreetView(
		cid: string,
		check: Promise<StreetView.StreetViewInfo | null>
	) {
		const info = await check
		if (!info || this.cid !== cid) return
		runInAction(() => {
			this.streetView = info
		})
	}

	/**
	 * On the tablet the comparison replaces the post inside the same panel, not a new screen. It
	 * always opens on Street View, even without a panorama, so the camera never pops up unasked.
	 */
	@action.bound
	openCompare() {
		this.compareMode = 'streetView'
	}

	@action.bound
	closeCompare() {
		this.compareMode = null
	}

	/** The colour version while it is on; `original` for the black-and-white photo under it. */
	@action.bound
	openFullScreen(original = false) {
		// The header keeps the previous photo's buttons while the next one loads.
		if (!this.postInfo) return
		const cid = this.postInfo.cid.toString()
		const colour = original ? undefined : this.colorize.localFile
		const uri = colour ?? this.imageLink
		const loaded = this.loadedResolution
		this.options.openFullScreen({
			title: this.postInfo.title,
			cid,
			uri,
			file: this.postInfo.file,
			localFile: colour,
			// Only for that same file. After a quality change the preview's size is the previous
			// file's until the new one loads, the colour version may have been made at another
			// quality, and a late load from the previous photo carries its own link; a local colour
			// file is cheap to measure.
			resolution: loaded?.uri === uri ? loaded.resolution : undefined
		})
	}

	@action.bound
	onImageLoad() {
		this.isImageLoaded = true
	}

	@action.bound
	onImageResolution(resolution: PhotoPost.Resolution, uri: string) {
		this.loadedResolution = { uri, resolution }
	}

	@action.bound
	toggleFavorite() {
		if (!this.postInfo) return
		const cid = this.postInfo.cid.toString()
		this.isFavorite = PhotoPost.toggleFavorite(this.postInfo, cid)
	}

	@action.bound
	share() {
		if (!this.postInfo) return
		sharePhoto(this.postInfo.title, this.postInfo.cid.toString())
	}

	@action.bound
	saveImage() {
		if (!this.postInfo) return
		// The colour version when it is on: saving gives what the panel shows.
		const local = this.colorize.localFile
		if (local) saveLocalImage(local)
		else savePhoto(this.postInfo.title, this.postInfo.file)
	}
}
