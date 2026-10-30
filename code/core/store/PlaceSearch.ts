import { action, makeObservable, observable, runInAction } from 'mobx'
import ApiService, { PlaceSearchError, isAbort } from '../api/apiService'
import { LocationItem } from '../types/apiPhotoList'
import LocaleStore, { AppLocale } from './Locale.store'

/** Shorter text, once normalized, searches for nothing: it matches too many places to help. */
export const MIN_QUERY = 3
/** How long typing has to pause before the text is searched, in ms. */
const DEBOUNCE = 500
/**
 * The least time between the starts of two requests from this device, retries included, in ms:
 * LocationIQ limits the key's requests per second, and every install shares the key.
 */
const MIN_INTERVAL = 1000
/** How long a request may go unanswered before the search counts as failed, in ms. */
const TIMEOUT = 8000
/** How many places the list shows. */
const SHOWN = 5
/** How many searches the session keeps the answers of. */
const CACHE_SIZE = 50
/** The pauses before the quiet retries of a request refused for the per-second limit, in ms. */
const RETRY_DELAYS = [1000, 2000]
/** Up to this much is added to each pause, so devices refused together do not retry together. */
const RETRY_JITTER = 300

/** The text as it is searched: spaces at the ends and runs of spaces do not change the places. */
export const normalizePlaceQuery = (value: string) =>
	value.trim().replace(/\s+/g, ' ')

const PLACE_LANGUAGES: Partial<Record<AppLocale, string>> = {
	ru: 'ru',
	uk: 'uk',
	pl: 'pl',
	de: 'de',
	cs: 'cs',
	fr: 'fr',
	en: 'en',
	be: 'ru'
}

/**
 * The language places are named in, for an interface language. LocationIQ has names in en, cs,
 * nl, fr, de, id, it, no, pl, es, ru, sv and uk; a Belarusian interface gets Russian names, the
 * closest of those, and the other languages get English.
 */
export const placeSearchLanguage = (locale: AppLocale): string =>
	PLACE_LANGUAGES[locale] ?? 'en'

/**
 * Answers already had this session, keyed by language and normalized text, the least recently used
 * first so that it is the one dropped beyond CACHE_SIZE. A search that found nothing is kept too:
 * typing it again asks nothing either. Kept outside the class, so it serves every map.
 */
const cache = new Map<string, LocationItem[]>()
/**
 * When the last request from this device started, to keep MIN_INTERVAL between them. Read off
 * performance.now(), which only runs forward: a wall clock set back would hold the next search
 * for as long as it was moved.
 */
let lastStart = -Infinity

const cached = (key: string) => {
	const places = cache.get(key)
	if (!places) return undefined
	// Moved to the end: the searches used last are the ones kept.
	cache.delete(key)
	cache.set(key, places)
	return places
}

const remember = (key: string, places: LocationItem[]) => {
	cache.delete(key)
	cache.set(key, places)
	if (cache.size > CACHE_SIZE) {
		const oldest = cache.keys().next()
		if (!oldest.done) cache.delete(oldest.value)
	}
}

/**
 * 'busy' is a rate limit that lifts within a minute, 'dayLimit' the daily quota; 'empty' found
 * nothing.
 */
export type PlaceSearchStatus =
	'idle' | 'loading' | 'done' | 'empty' | 'busy' | 'dayLimit' | 'error'

/** What the field tells about a search that brought no places. */
const failureStatus = (error: unknown): PlaceSearchStatus => {
	if (!(error instanceof PlaceSearchError)) return 'error'
	switch (error.kind) {
		case 'second':
		case 'minute':
			return 'busy'
		case 'day':
			return 'dayLimit'
		default:
			return 'error'
	}
}

/**
 * The map's place search, shared by the phone and the tablet: the text in the field, the places
 * found for it and how the search went. The text is searched once typing pauses, and an answer
 * for text that has changed since, or that came after the list was cleared, is dropped.
 * LocationIQ's rate limits are kept to by spacing the requests, retrying a refusal for the
 * per-second limit quietly and keeping the answers for the session.
 */
export class PlaceSearch {
	/** The field's text as typed. */
	@observable query = ''
	/** At most SHOWN, best match first. */
	@observable.ref places: LocationItem[] = []
	@observable status: PlaceSearchStatus = 'idle'
	/** The debounce, or a wait for MIN_INTERVAL or before a retry. */
	private timer: ReturnType<typeof setTimeout> | null = null
	/** Gives the request in flight up after TIMEOUT. */
	private timeoutTimer: ReturnType<typeof setTimeout> | null = null
	private controller: AbortController | null = null
	/** Counts the searches, so an answer overtaken by a newer search or by clearing is dropped. */
	private request = 0
	/**
	 * The language and text being searched or shown, so that the same search is not repeated. A
	 * search that failed is not shown, so it is cleared then.
	 */
	private searched = ''

	constructor() {
		makeObservable(this)
	}

	@action.bound
	setQuery(value: string) {
		this.query = value
		const query = normalizePlaceQuery(value)
		if (query.length < MIN_QUERY) {
			this.clearResults()
			return
		}
		const lang = placeSearchLanguage(LocaleStore.locale)
		const key = `${lang}|${query}`
		if (key === this.searched) return
		this.cancel()
		this.searched = key
		const found = cached(key)
		if (found) {
			this.show(found)
			return
		}
		// The places shown stay until the answer replaces them, rather than the list blinking out
		// with every letter.
		this.status = 'loading'
		const request = this.request
		this.timer = setTimeout(() => this.send(query, lang, request, 0), DEBOUNCE)
	}

	/** Empties the list and stops the search under way; the field keeps its text. */
	@action.bound
	clearResults() {
		this.cancel()
		this.searched = ''
		this.places = []
		this.status = 'idle'
	}

	/** Stops whatever is under way: a wait, the request in flight and its timeout. */
	private cancel() {
		this.request++
		if (this.timer) clearTimeout(this.timer)
		this.timer = null
		if (this.timeoutTimer) clearTimeout(this.timeoutTimer)
		this.timeoutTimer = null
		this.controller?.abort()
		this.controller = null
	}

	private show(places: LocationItem[]) {
		this.places = places.slice(0, SHOWN)
		this.status = places.length ? 'done' : 'empty'
	}

	/**
	 * Sends the search once MIN_INTERVAL has passed since the last request started, and retries a
	 * refusal for the per-second limit up to RETRY_DELAYS.length times. Takes the text and the
	 * language the search was scheduled with, never what the field holds by then.
	 */
	private async send(
		query: string,
		lang: string,
		request: number,
		retries: number
	) {
		if (request !== this.request) return
		this.timer = null
		const wait = lastStart + MIN_INTERVAL - performance.now()
		if (wait > 0) {
			this.timer = setTimeout(
				() => this.send(query, lang, request, retries),
				wait
			)
			return
		}
		lastStart = performance.now()
		const controller = new AbortController()
		let timedOut = false
		let timeout!: ReturnType<typeof setTimeout>
		// The attempt fails at TIMEOUT whether or not the abort reaches it: expo/fetch, which stands
		// in for fetch, never settles a body read that an abort or a dropped connection cut short.
		const expired = new Promise<never>((_, reject) => {
			timeout = setTimeout(() => {
				timedOut = true
				controller.abort()
				reject(new PlaceSearchError('error'))
			}, TIMEOUT)
		})
		this.controller = controller
		this.timeoutTimer = timeout
		try {
			const places = await Promise.race([
				ApiService.searchPlace(query, lang, controller.signal),
				expired
			])
			if (request !== this.request) return
			remember(`${lang}|${query}`, places)
			runInAction(() => this.show(places))
		} catch (error) {
			if (request !== this.request) return
			if (
				error instanceof PlaceSearchError &&
				error.kind === 'second' &&
				retries < RETRY_DELAYS.length
			) {
				this.timer = setTimeout(
					() => this.send(query, lang, request, retries + 1),
					RETRY_DELAYS[retries] + Math.random() * RETRY_JITTER
				)
				return
			}
			// Only the timeout's abort is a failure; any other was a cancel.
			if (isAbort(error) && !timedOut) return
			runInAction(() => {
				this.places = []
				this.status = failureStatus(error)
				// Not kept as searched, so typing the text again or coming back to the field tries it
				// again rather than leaving the failure up.
				this.searched = ''
			})
		} finally {
			clearTimeout(timeout)
			// Unless cancelling has already handed these to a newer search.
			if (this.controller === controller) {
				this.controller = null
				this.timeoutTimer = null
			}
		}
	}
}
