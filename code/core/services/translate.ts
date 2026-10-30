import { Platform } from 'react-native'
import type { AppLocale } from '../store/Locale.store'
import { getApiKey, getAppIdentity } from '../../modules/app-keys'

/**
 * Google's Cloud Translation API (Basic, v2). The key is restricted to this app and to this API,
 * and the project's quotas cap it at 15,000 characters a day with the paid LLM model shut off, so
 * it stays within the monthly free allowance whoever uses it.
 */
const ENDPOINT = 'https://translation.googleapis.com/language/translate/v2'
const KEY = getApiKey('TRANSLATE_API_KEY')
/** A request still unanswered after this long counts as failed, in ms. */
const TIMEOUT = 15000

/** Translation is offered only in a build that was given the key. */
export const TRANSLATION_AVAILABLE = KEY.length > 0

/**
 * Why a translation failed: the day's quota is spent ('dayLimit', until midnight Pacific time),
 * too many characters this minute ('busy'), or anything else.
 */
export type TranslateFailure = 'dayLimit' | 'busy' | 'error'

export class TranslateError extends Error {
  constructor(readonly kind: TranslateFailure) {
    super(`Translation failed: ${kind}`)
  }
}

/**
 * The headers a key restricted to this app is checked against. Google's own SDKs send them by
 * themselves; a plain request has to. Read once: they never change while the app runs.
 */
const identityHeaders = ((): Record<string, string> => {
  const identity = getAppIdentity()
  if (Platform.OS === 'ios') {
    return identity.bundleId ? { 'X-Ios-Bundle-Identifier': identity.bundleId } : {}
  }
  return identity.packageName && identity.certSha1
    ? { 'X-Android-Package': identity.packageName, 'X-Android-Cert': identity.certSha1 }
    : {}
})()

/** Markup or an entity: such a text is sent as HTML so that both come back intact. */
const isHtml = (text: string) => /<[a-z!/]|&(#\d+|#x[\da-f]+|[a-z]+);/i.test(text)

/**
 * Google charges for every character sent, tags and all, and a PastVu link's address is some 40
 * of them: addresses go out as short tokens and are put back in the answer.
 */
const shortenLinks = (html: string, links: string[]) =>
  html.replace(/href="([^"]*)"/g, (_match, url: string) => {
    links.push(url)
    return `href="${links.length - 1}"`
  })

const restoreLinks = (html: string, links: string[]) =>
  html.replace(/href="(\d+)"/g, (match, index: string) => {
    const url = links[Number(index)]
    return url === undefined ? match : `href="${url}"`
  })

const failureOf = (status: number, reason: string | undefined, message: string | undefined) => {
  if (reason === 'dailyLimitExceeded' || /daily limit/i.test(message ?? '')) return 'dayLimit'
  if (status === 429 || reason === 'userRateLimitExceeded' || reason === 'rateLimitExceeded') {
    return 'busy'
  }
  return 'error'
}

/** One request for texts of one format; answers in the same order. */
const request = async (texts: string[], to: AppLocale, format: 'html' | 'text') => {
  let timer: ReturnType<typeof setTimeout> | undefined
  // expo/fetch, which stands in for fetch, may never settle a body read cut short, so the timeout
  // races the request instead of aborting it.
  const expired = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new TranslateError('error')), TIMEOUT)
  })
  const call = async () => {
    let response: Response
    try {
      response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': KEY,
          ...identityHeaders,
        },
        body: JSON.stringify({ q: texts, target: to, format }),
      })
    } catch {
      throw new TranslateError('error')
    }
    const body = await response.json().catch(() => null)
    if (!response.ok) {
      const error = body?.error
      throw new TranslateError(
        failureOf(response.status, error?.errors?.[0]?.reason, error?.message),
      )
    }
    const translations: { translatedText?: unknown }[] | undefined = body?.data?.translations
    if (!Array.isArray(translations) || translations.length !== texts.length) {
      throw new TranslateError('error')
    }
    return translations.map(item =>
      typeof item.translatedText === 'string' ? item.translatedText : '',
    )
  }
  try {
    return await Promise.race([call(), expired])
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Translates texts into the given language: one result per text, in the same order. The texts are
 * comments and photo titles and descriptions as PastVu sends them; those with markup go as HTML
 * and come back with it intact, the rest as plain text, so a title gets no entities. An empty text
 * comes back empty without being sent: Google would still charge a character for it. The source
 * language is left to Google, which tells it at no extra charge.
 *
 * Throws TranslateError, telling a spent daily quota apart from other failures.
 */
export const translateTexts = async (texts: string[], to: AppLocale): Promise<string[]> => {
  if (!TRANSLATION_AVAILABLE) throw new TranslateError('error')
  const result = texts.map(() => '')
  const groups = { html: [] as number[], text: [] as number[] }
  texts.forEach((text, index) => {
    if (text.trim()) groups[isHtml(text) ? 'html' : 'text'].push(index)
  })
  const links: string[] = []
  await Promise.all(
    (['html', 'text'] as const).map(async format => {
      const indexes = groups[format]
      if (!indexes.length) return
      const sent = indexes.map(index =>
        format === 'html' ? shortenLinks(texts[index], links) : texts[index],
      )
      const translated = await request(sent, to, format)
      indexes.forEach((index, position) => {
        result[index] =
          format === 'html' ? restoreLinks(translated[position], links) : translated[position]
      })
    }),
  )
  return result
}
