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
  rs: [number, number]
  s: number
  title: string
  year: number
}
