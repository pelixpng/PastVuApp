export interface NewsUser {
  avatar: string
  disp: string
  login: string
}

export interface NewsItems {
  _id: string
  title: string
  txt: string
  cid: number
  pdate: string
  notice: string
  ccount: number
  user: NewsUser
}

export interface NewsDetail extends NewsItems {
  txt: string
}

export interface NewsPhoto {
  cid: number
  dir: string
  file: string
  /** Region cids, the deepest first; 0 first for a photo without coordinates. */
  rs?: number[]
  s: number
  title: string
  year: number
}
