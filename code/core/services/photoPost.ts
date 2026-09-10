import { ExtensionStorage } from '@bacons/apple-targets'
import ApiService from '../api/apiService'
import { MMKVStorage } from '../storage/mmkv'
import { IosTargetStorage } from '../storage/appleTarget'
import { IComment, Users } from '../types/apiPhotoComment'

export type CollectionItem = {
  title: string
  description: string
  cid: string
  file: string
}

export type LoadedPost = {
  photo: Photo
  users: Users | null
  comments: IComment[]
}

/** Keeps the persisted history from growing without bound. */
export const HISTORY_LIMIT = 200

export const toCollectionItem = (photo: Photo, cid: string): CollectionItem => ({
  title: photo.title,
  description: `${photo.y} ${photo.regions.map(region => region.title_local).join(', ')}`,
  cid,
  file: photo.file,
})

/**
 * Loads everything a post screen needs.
 *
 * The comments request only needs the cid, which the caller already has, so it runs alongside the
 * photo request instead of waiting a whole round-trip for `ccount`. Failing comments must not fail
 * the post: they degrade to an empty list while the photo still renders.
 */
export const loadPost = async (cid: string): Promise<LoadedPost> => {
  const [info, discussion] = await Promise.all([
    ApiService.getPhotoInfo(cid),
    ApiService.getComments(cid).catch(() => null),
  ])
  return {
    photo: info.result.photo,
    users: discussion?.users ?? null,
    comments: discussion?.comments ?? [],
  }
}

/**
 * Puts the photo at the top of the viewing history and mirrors it to the iOS widget.
 *
 * Re-visiting an already seen photo moves it back to the top rather than being ignored, so the
 * history reflects the actual viewing order. Pass `current` when the caller keeps its own copy of
 * the list; the updated list is returned so that copy can stay in sync.
 */
export const recordHistory = (
  photo: Photo,
  cid: string,
  current?: CollectionItem[],
): CollectionItem[] => {
  const history: CollectionItem[] = current ?? MMKVStorage.get('History') ?? []
  const updated = [
    toCollectionItem(photo, cid),
    ...history.filter(item => item.cid !== cid),
  ].slice(0, HISTORY_LIMIT)

  MMKVStorage.set('History', updated)
  IosTargetStorage.set('History', JSON.stringify(updated))
  ExtensionStorage.reloadWidget()
  return updated
}

export const isFavorite = (cid: string): boolean => {
  const favorites: CollectionItem[] = MMKVStorage.get('Favorites') ?? []
  return favorites.some(item => item.cid === cid)
}

/** Adds or removes the photo from favorites and reports the resulting state. */
export const toggleFavorite = (photo: Photo, cid: string): boolean => {
  const favorites: CollectionItem[] = MMKVStorage.get('Favorites') ?? []
  const wasFavorite = favorites.some(item => item.cid === cid)
  const updated = wasFavorite
    ? favorites.filter(item => item.cid !== cid)
    : [toCollectionItem(photo, cid), ...favorites]

  MMKVStorage.set('Favorites', updated)
  return !wasFavorite
}

export type Resolution = { width: number; height: number }

/**
 * Rendered size of the photo, known from the post data before the image is fetched.
 *
 * The served image has a watermark strip appended below it, so it is `waterh` pixels taller than
 * the stored photo. Knowing this up front lets the preview reserve its exact height, so the text
 * under it does not jump once the image arrives. Verified against /a/ and /d/; the /h/ thumbnail
 * is a centre crop with its own ratio and is simply covered into this box.
 */
export const photoResolution = (photo?: Photo | null): Resolution | undefined =>
  photo?.w && photo.h ? { width: photo.w, height: photo.h + (photo.waterh ?? 0) } : undefined
