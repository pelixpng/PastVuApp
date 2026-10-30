import { action, computed, makeObservable, observable, runInAction } from 'mobx'
import { Share } from 'react-native'
import ApiService, { ApiError } from '../api/apiService'
import { t } from '../i18n'
import { IComment, Users } from '../types/apiPhotoComment'
import { UserProfile } from '../types/apiUserProfile'
import { getRegionPath } from '../utils/getRegionPath'

/**
 * What the phone and tablet profile screens share: loading the profile and serving the user's
 * photos and comments page by page. Each screen keeps its own state in its view model.
 */

export type ProfileState =
  | { status: 'loading' }
  | { status: 'ready'; profile: UserProfile }
  | { status: 'notFound' }
  | { status: 'error' }

export type ProfileTab = 'photos' | 'comments'

/** A photo row, shaped like a collection item: the photo it opens and its two lines. */
export type ProfilePhotoRow = {
  kind: 'photo'
  key: string
  cid: string
  title: string
  description: string
  file: string
}

/** What a comment was left on: a photo, or a news post. */
export type CommentTarget = 'photo' | 'news'

/** How many comments the user left under photos and under news; every comments page carries both. */
export type CommentCounts = Record<CommentTarget, number>

/** A news post heading its comments; drawn like a photo row, with an icon for the picture. */
export type ProfileNewsRow = {
  kind: 'news'
  key: string
  cid: string
  title: string
  description: string
}

/** One of the user's comments, drawn like a reply under the photo or post it belongs to. */
export type ProfileCommentRow = {
  kind: 'comment'
  key: string
  comment: IComment
  /** What the comment was left on, opened by a tap on the comment. */
  target: CommentTarget
  targetCid: string
  targetTitle: string
  /** The last comment under its photo or post: the thread line from it ends here. */
  lastInGroup: boolean
}

export type ProfileRow = ProfilePhotoRow | ProfileNewsRow | ProfileCommentRow

/** A comment as loaded, before it is grouped under what it belongs to. */
export type UserCommentItem = {
  key: string
  target: CommentTarget
  object: { cid: string; title: string; file?: string; years?: string; comments?: number }
  comment: { cid: string; txt: string; stamp: number }
}

type Page<T> = { items: T[]; hasMore: boolean }

const PHOTOS_PER_PAGE = 30

/** Shares the profile's page on the site, the same way photos and news are shared. */
export const shareProfileLink = (login: string, name?: string) => {
  Share.share({ message: `${name ?? login}: https://pastvu.com/u/${encodeURIComponent(login)}` })
}

/** The profile, or why it cannot be shown: an unknown login differs from a failed request. */
export const loadProfileState = async (login: string): Promise<ProfileState> => {
  try {
    return { status: 'ready', profile: await ApiService.getUserProfile(login) }
  } catch (error) {
    const notFound = error instanceof ApiError && error.code === 'NO_SUCH_USER'
    return { status: notFound ? 'notFound' : 'error' }
  }
}

/** A page (from 0) of the photos the user uploaded, described as "year, region". */
export const fetchPhotosPage = async (
  login: string,
  page: number,
): Promise<Page<ProfilePhotoRow>> => {
  const skip = page * PHOTOS_PER_PAGE
  // The page brings the names of its own regions.
  const { total, photos, rhash } = await ApiService.getUserPhotos(login, skip, PHOTOS_PER_PAGE)
  return {
    items: photos.map(photo => ({
      kind: 'photo' as const,
      key: String(photo.cid),
      cid: String(photo.cid),
      title: photo.title,
      description: [photo.year, getRegionPath(photo.rs, rhash)]
        .filter(Boolean)
        .join(', '),
      file: photo.file,
    })),
    hasMore: photos.length > 0 && skip + photos.length < total,
  }
}

/**
 * A page (from 0) of the user's comments under photos or under news, newest first, each with what
 * it belongs to. `onCounts` receives both totals, which every page carries.
 */
export const fetchCommentsPage = async (
  login: string,
  page: number,
  target: CommentTarget,
  onCounts?: (counts: CommentCounts) => void,
): Promise<Page<UserCommentItem>> => {
  const { photoTotal, newsTotal, perPage, comments, objects } = await ApiService.getUserComments(
    login,
    page + 1,
    target,
  )
  onCounts?.({ photo: photoTotal, news: newsTotal })
  const total = target === 'photo' ? photoTotal : newsTotal
  return {
    items: comments.flatMap(comment => {
      const object = objects[String(comment.obj)]
      if (!object) return []
      return [
        {
          key: String(comment.cid),
          target,
          object: {
            cid: String(object.cid),
            title: object.title,
            file: object.file,
            years: object.y,
            comments: object.ccount,
          },
          // Comments under a photo come with a numeric stamp; this one is ISO. The number keeps
          // the date formatted the same way as in the photo's own discussion.
          comment: { cid: String(comment.cid), txt: comment.txt, stamp: Date.parse(comment.stamp) },
        },
      ]
    }),
    hasMore: comments.length > 0 && (page + 1) * perPage < total,
  }
}

/**
 * Each loaded comment in the shape the comment component takes, made once per item: the rows are
 * grouped anew with every page, and a new object each time redrew every comment on screen. A paged
 * list keeps the items it already has, so the item is a lasting key.
 */
const shownComments = new WeakMap<UserCommentItem, IComment>()

const shownComment = (item: UserCommentItem, login: string): IComment => {
  let comment = shownComments.get(item)
  if (!comment) {
    comment = {
      cid: item.comment.cid,
      user: login,
      txt: item.comment.txt,
      stamp: item.comment.stamp,
      s: 5,
      type: 0,
      level: 0,
    }
    shownComments.set(item, comment)
  }
  return comment
}

/**
 * The comments as the tab shows them: each photo or post once, followed by the user's comments
 * under it. Consecutive comments on the same one share its row; the list stays in time order, so
 * something the user came back to later appears again further down.
 */
export const groupComments = (items: UserCommentItem[], login: string): ProfileRow[] => {
  const rows: ProfileRow[] = []
  let current: string | null = null
  let previous: ProfileCommentRow | null = null
  for (const item of items) {
    const group = `${item.target}-${item.object.cid}`
    if (group !== current) {
      if (previous) previous.lastInGroup = true
      current = group
      const key = `${group}-${item.comment.cid}`
      rows.push(
        item.target === 'photo'
          ? {
              kind: 'photo',
              key,
              cid: item.object.cid,
              title: item.object.title,
              description: item.object.years ?? '',
              file: item.object.file ?? '',
            }
          : {
              kind: 'news',
              key,
              cid: item.object.cid,
              title: item.object.title,
              description:
                item.object.comments !== undefined
                  ? t('photo.commentsCount', { count: item.object.comments })
                  : '',
            },
      )
    }
    previous = {
      kind: 'comment',
      key: `comment-${item.comment.cid}`,
      comment: shownComment(item, login),
      target: item.target,
      targetCid: item.object.cid,
      targetTitle: item.object.title,
      lastInGroup: false,
    }
    rows.push(previous)
  }
  if (previous) previous.lastInGroup = true
  return rows
}

/** The one-author users map the comment component needs, in the shape photo comments use. */
export const commentAuthor = (profile: UserProfile): Users => ({
  [profile.login]: {
    avatar: profile.avatar ? `/_a/h/${profile.avatar}` : '',
    disp: profile.disp,
    login: profile.login,
    ranks: [],
    online: profile.online,
  },
})

/** What a list footer needs to know about a paged list. */
export interface PagedListState {
  readonly loading: boolean
  readonly failed: boolean
  readonly isEmpty: boolean
  loadMore(): void
}

/** A list the API serves in pages; `loadMore` fetches the next one, and retries after a failure. */
export class PagedList<T extends { key: string }> implements PagedListState {
  @observable.ref items: T[] = []
  @observable loading = false
  @observable failed = false
  @observable hasMore = true
  private nextPage = 0

  constructor(private readonly fetchPage: (page: number) => Promise<Page<T>>) {
    makeObservable(this)
  }

  /** Everything is loaded and there is nothing: an empty list, not one still on its way. */
  @computed
  get isEmpty() {
    return !this.hasMore && this.items.length === 0
  }

  @action.bound
  async loadMore() {
    if (this.loading || !this.hasMore) return
    this.loading = true
    this.failed = false
    try {
      const { items, hasMore } = await this.fetchPage(this.nextPage)
      runInAction(() => {
        const known = new Set(this.items.map(item => item.key))
        this.items = [...this.items, ...items.filter(item => !known.has(item.key))]
        this.hasMore = hasMore
        this.nextPage += 1
        this.loading = false
      })
    } catch {
      runInAction(() => {
        this.failed = true
        this.loading = false
      })
    }
  }
}
