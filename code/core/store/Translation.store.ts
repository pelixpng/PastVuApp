import { action, makeObservable, observable, reaction, runInAction } from 'mobx'
import AppLocaleModule from '../../modules/app-locale'
import {
  TRANSLATION_AVAILABLE,
  TranslateError,
  TranslateFailure,
  translateTexts,
} from '../services/translate'
import LocaleStore, { AppLocale } from './Locale.store'
import { MMKVStorage } from '../storage/mmkv'

/** How many texts the session keeps the detected language of. */
const DETECTED_LIMIT = 2000
/** How many translations the session keeps, so showing one again asks the service nothing. */
const TRANSLATED_LIMIT = 200
/**
 * How much of a text its language is told from: the opening of a long description is enough, and
 * the whole of it would only take longer.
 */
const DETECT_LENGTH = 1000

const NAMED_ENTITIES = new Map([
  ['nbsp', ' '],
  ['amp', '&'],
  ['lt', '<'],
  ['gt', '>'],
  ['quot', '"'],
])

/**
 * Other named entities are punctuation and symbols (&laquo;, &mdash;), which say nothing about the
 * language, while their names would read as Latin words: they become spaces.
 */
const decodeEntity = (_entity: string, name: string) => {
  const named = NAMED_ENTITIES.get(name)
  if (named !== undefined) return named
  if (!name.startsWith('#')) return ' '
  const hex = name[1] === 'x' || name[1] === 'X'
  const code = hex ? parseInt(name.slice(2), 16) : parseInt(name.slice(1), 10)
  return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : ' '
}

/**
 * What a comment or a description says, without its markup: tags dropped, entities decoded, links
 * removed and spaces collapsed. Language detection reads this, so neither markup nor a bare link,
 * which looks English whatever the language around it, sways it.
 */
export const plainText = (html: string): string =>
  html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&(#\d+|#[xX][\da-fA-F]+|[a-zA-Z]+);/g, decodeEntity)
    .replace(/(?:https?:\/\/|\bwww\.)\S+/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()

/** At least two letters: a lone letter, numbers or emoji say nothing about a language. */
const hasWords = (text: string) => /\p{L}\P{L}*\p{L}/u.test(text)

const CYRILLIC = /[\u0400-\u052f]/
const LATIN = /[a-zA-Z\u00c0-\u024f\u1e00-\u1eff]/

/**
 * The letters each app language is written in; Serbian uses both alphabets. A text with none of
 * them is in another language, whatever a detector makes of it: a one-word Russian place name may
 * read as Russian or Ukrainian too evenly for the detector to name either, yet in an English app it
 * plainly needs translating.
 */
const SCRIPTS: Record<AppLocale, RegExp> = {
  ru: CYRILLIC,
  uk: CYRILLIC,
  be: CYRILLIC,
  sr: new RegExp(`${CYRILLIC.source}|${LATIN.source}`),
  en: LATIN,
  pl: LATIN,
  de: LATIN,
  cs: LATIN,
  hu: LATIN,
  fi: LATIN,
  et: LATIN,
  lv: LATIN,
  lt: LATIN,
  fr: LATIN,
}

/**
 * Serbian, Croatian and Bosnian count as one language: their readers understand each other, and
 * detectors tell them apart poorly on short texts.
 */
const SERBO_CROATIAN = new Set(['sr', 'hr', 'bs'])

/** The base code of a language tag, the same for languages a reader of one understands. */
const comparable = (code: string) => {
  const base = code.toLowerCase().split(/[-_]/)[0]
  return SERBO_CROATIAN.has(base) ? 'sr' : base
}

/**
 * The languages of the texts, told on the device by modules/app-locale for an app running in
 * `locale`. Null for every text when the installed build predates the native method or the call
 * fails: this session, only texts in another alphabet then get a translate button.
 */
const detectLanguages = async (
  texts: string[],
  locale: AppLocale,
): Promise<(string | null)[]> => {
  try {
    const found = await AppLocaleModule.detectLanguages?.(
      texts.map(text => text.slice(0, DETECT_LENGTH)),
      locale,
    )
    return texts.map((_, index) => found?.[index] ?? null)
  } catch {
    return texts.map(() => null)
  }
}

/**
 * A detected language's key: the text and the app's language, which iOS leans towards on short
 * texts, so the same words may read differently in another language of the app.
 */
const detectionKey = (locale: AppLocale, text: string) => `${locale}\n${text}`

/** A translation's key: the language and the source texts, so a changed text is translated anew. */
const translationKey = (locale: AppLocale, texts: string[]) =>
  `${locale}\n${texts.join('\u0000')}`

export const commentTranslationId = (cid: string | number) => `comment:${cid}`
export const photoTranslationId = (cid: string | number) => `photo:${cid}`

export type TranslationState = 'original' | 'loading' | 'translated' | 'failed'

/** A translation on screen and the language it was made for. */
type Shown = { locale: AppLocale; texts: string[] }
/** A translation the user is waiting for, and the request that brings it. */
type Loading = { locale: AppLocale; request: number }

/**
 * Translations of comments and of photo titles and descriptions into the app's language, by item
 * id, shared by every screen that shows the item: the phone and tablet posts, news and profiles.
 *
 * It also tells which texts are in another language, so a translate button shows only where one
 * helps. The language is detected on the device, in batches, and kept for the session for each
 * language the app has run in.
 */
class TranslationStore {
  /**
   * The settings switch, on unless turned off: off, no translate button or link shows anywhere,
   * nor any translation, and so the tablet never covers a Yandex map for Google's badge.
   */
  @observable enabled = MMKVStorage.get('translation') !== 'no'
  /**
   * The detected language of each plain text, by detectionKey; null when it could not be told.
   * Oldest first.
   */
  private readonly languages = observable.map<string, string | null>()
  private readonly shown = observable.map<string, Shown>({}, { deep: false })
  private readonly loading = observable.map<string, Loading>({}, { deep: false })
  /**
   * Items whose last translation failed, with the language it was for and why; the original
   * shows.
   */
  private readonly failed = observable.map<string, { locale: AppLocale; kind: TranslateFailure }>(
    {},
    { deep: false },
  )
  /**
   * Texts met while rendering that wait for the next detection batch, by the app's language. Not
   * observable: render reads the store, and must not change what it observes.
   */
  private readonly queued = new Map<AppLocale, Set<string>>()
  /** Keys of texts in a batch on its way, so a render meanwhile does not queue them again. */
  private readonly detecting = new Set<string>()
  private flushTimer: ReturnType<typeof setTimeout> | null = null
  /** Translations had this session, by translationKey, the least recently used first. */
  private readonly translated = new Map<string, string[]>()
  /** Requests out, by translationKey, so an item asked for again waits on the one already sent. */
  private readonly fetching = new Map<string, Promise<string[]>>()
  /** Counts the wishes, so a result answers only the one still current. */
  private request = 0

  constructor() {
    makeObservable(this)
    // Translations into the old language go back to the original, and switching back later does
    // not bring them out again unasked.
    reaction(
      () => LocaleStore.locale,
      () =>
        runInAction(() => {
          this.shown.clear()
          this.loading.clear()
          this.failed.clear()
        }),
    )
  }

  /**
   * Whether the text (a comment, HTML allowed) is in a language other than the app's: at once when
   * it has none of the letters the app's language is written in, otherwise once its language is
   * detected. False until then: the first call queues it for detection, and observers render again
   * once the answer comes.
   */
  differsFromApp(html: string) {
    return this.textDiffers(plainText(html))
  }

  /** A photo needs translating when its title or its description is in another language. */
  photoDiffers(title: string, desc?: string | null) {
    return this.differsFromApp(title) || (!!desc && this.differsFromApp(desc))
  }

  @action.bound
  setEnabled(on: boolean) {
    this.enabled = on
    MMKVStorage.set('translation', on ? 'yes' : 'no')
    // Turned back on, it starts from the originals rather than bringing old translations back.
    if (!on) {
      this.shown.clear()
      this.loading.clear()
      this.failed.clear()
    }
  }

  /** What the item shows; a language switch takes every item back to the original. */
  state(id: string): TranslationState {
    if (!this.enabled) return 'original'
    const locale = LocaleStore.locale
    if (this.loading.get(id)?.locale === locale) return 'loading'
    if (this.shown.get(id)?.locale === locale) return 'translated'
    if (this.failed.get(id)?.locale === locale) return 'failed'
    return 'original'
  }

  /** Why the item's last translation failed, while state(id) is 'failed'. */
  failure(id: string): TranslateFailure | undefined {
    return this.state(id) === 'failed' ? this.failed.get(id)?.kind : undefined
  }

  /** The translated texts, in the order given to toggle, while the translation is shown. */
  translation(id: string): string[] | undefined {
    return this.state(id) === 'translated' ? this.shown.get(id)?.texts : undefined
  }

  /**
   * The translate button or link: shows the item's texts in the app's language, fetching them
   * unless they were translated this session, or goes back to the original. Tapped while loading,
   * it calls the wish off; the translation still comes and is kept, but not shown.
   *
   * Resolves false only when the translation the user is waiting for failed, so the button can
   * say so; a wish called off or overtaken resolves true.
   */
  @action.bound
  async toggle(id: string, texts: string[]): Promise<boolean> {
    const state = this.state(id)
    if (state === 'translated') {
      this.shown.delete(id)
      return true
    }
    if (state === 'loading') {
      this.loading.delete(id)
      return true
    }
    const locale = LocaleStore.locale
    const key = translationKey(locale, texts)
    this.failed.delete(id)
    const known = this.cachedTranslation(key)
    if (known) {
      this.shown.set(id, { locale, texts: known })
      return true
    }
    const request = ++this.request
    this.loading.set(id, { locale, request })
    try {
      const translated = await this.fetch(key, texts, locale)
      runInAction(() => {
        if (!this.stillWanted(id, request)) return
        this.loading.delete(id)
        this.shown.set(id, { locale, texts: translated })
      })
      return true
    } catch (error) {
      return runInAction(() => {
        if (!this.stillWanted(id, request)) return true
        this.loading.delete(id)
        this.failed.set(id, {
          locale,
          kind: error instanceof TranslateError ? error.kind : 'error',
        })
        return false
      })
    }
  }

  /** The request is the item's current wish, and the app is still in the language it was for. */
  private stillWanted(id: string, request: number) {
    const loading = this.loading.get(id)
    return loading?.request === request && loading.locale === LocaleStore.locale
  }

  private textDiffers(text: string) {
    if (!TRANSLATION_AVAILABLE || !this.enabled || !hasWords(text)) return false
    const locale = LocaleStore.locale
    if (!SCRIPTS[locale].test(text)) return true
    const language = this.languageOf(text, locale)
    return !!language && comparable(language) !== comparable(locale)
  }

  /** The text's language once detected, null when it could not be told, undefined until then. */
  private languageOf(text: string, locale: AppLocale) {
    const key = detectionKey(locale, text)
    if (this.languages.has(key)) return this.languages.get(key)
    const queued = this.queued.get(locale) ?? new Set<string>()
    if (!queued.has(text) && !this.detecting.has(key)) {
      this.queued.set(locale, queued.add(text))
      // Every text rendered in the same pass goes in one native call.
      if (!this.flushTimer) this.flushTimer = setTimeout(this.flush, 0)
    }
    return undefined
  }

  private readonly flush = () => {
    this.flushTimer = null
    const batches = [...this.queued]
    this.queued.clear()
    // One call per language of the app, which is one unless the language changed this very moment.
    batches.forEach(([locale, texts]) => this.detect(locale, [...texts]))
  }

  private async detect(locale: AppLocale, texts: string[]) {
    const keys = texts.map(text => detectionKey(locale, text))
    keys.forEach(key => this.detecting.add(key))
    const found = await detectLanguages(texts, locale)
    runInAction(() => {
      keys.forEach((key, index) => this.rememberLanguage(key, found[index]))
    })
    keys.forEach(key => this.detecting.delete(key))
  }

  private rememberLanguage(key: string, language: string | null) {
    this.languages.set(key, language)
    while (this.languages.size > DETECTED_LIMIT) {
      const oldest = this.languages.keys().next()
      if (oldest.done) break
      this.languages.delete(oldest.value)
    }
  }

  /** One request per language and texts, shared by every item waiting for it. */
  private fetch(key: string, texts: string[], locale: AppLocale) {
    const sent = this.fetching.get(key)
    if (sent) return sent
    const sending = translateTexts(texts, locale)
      .then(translated => {
        // Matched to the texts by position, so a short answer would put text in the wrong place.
        if (translated.length !== texts.length) {
          throw new Error('Translation returned a different number of texts')
        }
        this.rememberTranslation(key, translated)
        return translated
      })
      .finally(() => this.fetching.delete(key))
    this.fetching.set(key, sending)
    return sending
  }

  private cachedTranslation(key: string) {
    const texts = this.translated.get(key)
    if (!texts) return undefined
    // Moved to the end: the translations used last are the ones kept.
    this.translated.delete(key)
    this.translated.set(key, texts)
    return texts
  }

  private rememberTranslation(key: string, texts: string[]) {
    this.translated.delete(key)
    this.translated.set(key, texts)
    if (this.translated.size > TRANSLATED_LIMIT) {
      const oldest = this.translated.keys().next()
      if (!oldest.done) this.translated.delete(oldest.value)
    }
  }
}

export default new TranslationStore()
