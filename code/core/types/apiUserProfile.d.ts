/**
 * A PastVu user as the public profile page on the site shows it. The API returns more (e-mail,
 * settings, watermark text); `ApiService.getUserProfile` drops everything the site keeps private.
 */
export interface UserProfile {
  login: string
  /** Display name: the real name if the user chose to show it, otherwise the login. */
  disp: string
  /** Relative path, served at `https://pastvu.com/_a/d/<avatar>` (100 px) and `/_a/h/` (50 px). */
  avatar?: string
  firstName?: string
  lastName?: string
  /** Free text as the user typed it, usually `dd.mm.yyyy`. */
  birthdate?: string
  sex?: 'm' | 'f'
  country?: string
  city?: string
  work?: string
  www?: string
  aboutme?: string
  /** ISO date. */
  regdate?: string
  /** Photos the user uploaded, as the site counts them in the profile. */
  pcount: number
  ccount: number
  /** Above 9 the site labels the user an administrator, above 4 a moderator. */
  role: number
  online: boolean
}

/** A photo from `photo.giveUserGallery`. */
export interface UserGalleryPhoto {
  cid: number
  file: string
  title: string
  year?: number
  /** Region cids, from the country down. */
  rs?: number[]
}

/** A comment from `comment.giveForUser`; `obj` is the cid of the photo it was left under. */
export interface UserComment {
  cid: number
  obj: number
  stamp: string
  txt: string
}

/** What a user comment belongs to, from the `objs` map of the same response: a photo or a news post. */
export interface UserCommentObject {
  cid: number
  title: string
  /** Photos only. */
  file?: string
  /** Photos only: the years as the site prints them, "1974" or "1921—1936". */
  y?: string
  /** News only: how many comments the post has. */
  ccount?: number
}
