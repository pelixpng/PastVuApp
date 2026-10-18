import { action, makeObservable, observable, reaction, runInAction } from 'mobx'
import { Image } from 'expo-image'
import ApiService from '../api/apiService'
import { NearbyPhoto } from '../types/apiPhotoList'
import { YearsRangeType } from '../types/components'
import { distanceInMeters } from '../utils/getMapData'

/** How many photos the list shows. */
const NEARBY_LIMIT = 30
/** How long the map has to rest before an open list asks again, in ms. */
const NEARBY_DEBOUNCE = 300
/**
 * How long a new list may wait for its date ranges and its first pictures before it is shown
 * anyway, in ms: it then comes in once and whole, instead of in steps.
 */
const PREPARE_LIMIT = 1200
/** Pictures fetched ahead: the rows that fit on a screen, and the first cards. */
const PREFETCH_ROWS = 10
const PREFETCH_CARDS = 3

const pause = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))

/** The same photos in the same order: only their distances can have changed. */
const sameList = (a: NearbyItem[], b: NearbyItem[]) =>
	a.length === b.length && a.every((item, index) => item.cid === b[index].cid)

/** A row of the list: a photo and how far it is from the map's centre, in metres. */
export type NearbyItem = NearbyPhoto & { distance: number }

/** "1914", or "1921 - 1930" for a photo dated to a range. */
export const formatNearbyYears = (item: NearbyItem) =>
	item.year2 ? `${item.year} - ${item.year2}` : `${item.year}`

/**
 * The map's "photos nearby" sheet, shared by the phone and the tablet: whether it is open, the
 * photos around the map's centre within the years on the slider, nearest first, and whether they
 * failed to load. While open it follows the map, asking again once the map has rested.
 *
 * Create it after the owner's makeObservable, so the getters read observables that are tracked.
 */
export class NearbySearch {
	/** Stays open while another tab or a photo is in front. */
	@observable open = false
	/** Nearest first; null until the first answer for this place. */
	@observable.ref photos: NearbyItem[] | null = null
	@observable failed = false
	/** The map moved or the years changed: a new list is on its way; the old one stays meanwhile. */
	@observable loading = false
	/** Goes up whenever a different list replaces the shown one, not when only distances change. */
	@observable version = 0
	/** Which pictures the sheet shows, so the matching ones are fetched ahead. */
	cards = false
	private timeoutId: ReturnType<typeof setTimeout> | null = null
	/** Counts the requests, so an answer overtaken by a newer request is dropped. */
	private request = 0
	/** The centre and years `photos` were fetched for. */
	private photosFor = ''

	constructor(
		private readonly centre: () => { latitude: number; longitude: number },
		private readonly years: () => YearsRangeType
	) {
		makeObservable(this)
		// A new centre or years range asks again once the map has settled.
		reaction(
			() => [centre(), years()],
			() => {
				if (!this.open) return
				// A spinner from the moment the map rests, rather than the old list changing under
				// the finger once the new one comes.
				runInAction(() => {
					this.loading = true
				})
				// An answer still out is for the previous place: dropped, or it would show that list.
				this.request++
				if (this.timeoutId) clearTimeout(this.timeoutId)
				this.timeoutId = setTimeout(() => this.load(), NEARBY_DEBOUNCE)
			}
		)
	}

	@action.bound
	toggle() {
		if (this.open) {
			this.close()
			return
		}
		this.open = true
		// The list from the last opening is for another place or other years: a spinner until the
		// new one comes is better than a wrong list.
		if (this.photosFor !== this.query()) {
			this.photos = null
			this.failed = false
		}
		this.load()
	}

	@action.bound
	close() {
		this.open = false
		this.loading = false
		if (this.timeoutId) clearTimeout(this.timeoutId)
	}

	private query() {
		const { latitude, longitude } = this.centre()
		return `${latitude},${longitude},${this.years().join('-')}`
	}

	/**
	 * Asks for the photos around the map's centre. The list on screen stays until the new one is
	 * ready: its date ranges and its first pictures are fetched first (for at most PREPARE_LIMIT),
	 * so it replaces the old one in a single step. The same photos as before change nothing but
	 * their distances.
	 */
	@action.bound
	async load() {
		const request = ++this.request
		const centre = this.centre()
		// Read once: the slider may move while the request is out, and the date ranges must be
		// looked up for the years this list was made for.
		const years = this.years()
		const query = this.query()
		try {
			const photos = await ApiService.getNearbyPhotos(
				centre.latitude,
				centre.longitude,
				undefined,
				NEARBY_LIMIT,
				years
			)
			if (request !== this.request) return
			const items = photos
				.map(photo => ({
					...photo,
					distance: distanceInMeters(centre, photo.location)
				}))
				.sort((a, b) => a.distance - b.distance)
			const shown = this.photos
			if (shown && sameList(shown, items)) {
				runInAction(() => {
					this.photos = items.map((item, index) =>
						shown[index].year2 ? { ...item, year2: shown[index].year2 } : item
					)
					this.failed = false
					this.loading = false
					this.photosFor = query
				})
				return
			}
			const cardPictures = items
				.slice(0, PREFETCH_CARDS)
				.map(item => `https://img.pastvu.com/d/${item.file}`)
			const rowPictures = items
				.slice(0, PREFETCH_ROWS)
				.map(item => `https://img.pastvu.com/h/${item.file}`)
			const cards = this.cards
			const withYears = (ranges: Map<string, number>) =>
				items.map(item => {
					const year2 = ranges.get(item.cid)
					return year2 ? { ...item, year2 } : item
				})
			let ranges: Map<string, number> | null = null
			// Without them the photos keep their single year.
			const rangesLookup = ApiService.getYearRanges(items, years).catch(
				() => new Map<string, number>()
			)
			await Promise.race([
				Promise.all([
					rangesLookup.then(found => {
						ranges = found
					}),
					Image.prefetch(cards ? cardPictures : rowPictures, 'disk').catch(() => false)
				]),
				pause(PREPARE_LIMIT)
			])
			if (request !== this.request) return
			runInAction(() => {
				this.photos = withYears(ranges ?? new Map())
				this.version++
				this.failed = false
				this.loading = false
				this.photosFor = query
			})
			// The other mode's first pictures, not waited for: dragged between the list and the row of
			// cards, the sheet shows them already there.
			Image.prefetch(cards ? rowPictures : cardPictures, 'disk').catch(() => false)
			// Date ranges slower than the limit still fill in, on the list they were made for.
			if (!ranges) {
				rangesLookup.then(found => {
					if (request !== this.request || !found.size) return
					runInAction(() => {
						this.photos = withYears(found)
					})
				})
			}
		} catch (error) {
			if (request !== this.request) return
			runInAction(() => {
				this.failed = true
				this.loading = false
				this.photosFor = ''
			})
		}
	}
}
