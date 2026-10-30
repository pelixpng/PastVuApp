import ApiService from '../api/apiService'
import { MMKVStorage } from '../storage/mmkv'
import { NewsItems } from '../types/apiNews'

/** How long a downloaded feed still answers links into news before it is asked for again. */
const FRESH_FOR = 5 * 60 * 1000

let feed: { news: Promise<NewsItems[]>; at: number } | null = null

/** The feed as last downloaded, on this launch or an earlier one: shown while a fresh one loads. */
export const savedNews = (): NewsItems[] | undefined => {
  const saved = MMKVStorage.get('News')
  return Array.isArray(saved) ? saved : undefined
}

/**
 * The news feed, shared by every screen. It is 160 KB on the wire, which every tap on a link into
 * news used to download again; a feed less than FRESH_FOR old now serves instead, and `fresh` asks
 * anyway, as the news tab does when it opens. Each download is kept on the device for `savedNews`.
 */
export const loadNews = (fresh = false): Promise<NewsItems[]> => {
  if (!feed || fresh || Date.now() - feed.at > FRESH_FOR) {
    const news: Promise<NewsItems[]> = ApiService.getNews().then((items: NewsItems[]) => {
      MMKVStorage.set('News', items)
      return items
    })
    const current = { news, at: Date.now() }
    feed = current
    // A failed download is not kept: the next call tries again.
    news.catch(() => {
      if (feed === current) feed = null
    })
  }
  return feed.news
}

/**
 * The post a link into news points to. One newer than the feed in hand brings a fresh feed;
 * without a connection, the feed kept on the device still serves. Throws only when there is
 * neither.
 */
export const findNews = async (cid: number): Promise<NewsItems | undefined> => {
  const find = (news: NewsItems[]) => news.find(post => post.cid === cid)
  try {
    return find(await loadNews()) ?? find(await loadNews(true))
  } catch (error) {
    const saved = savedNews()
    if (!saved) throw error
    return find(saved)
  }
}
