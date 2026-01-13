export interface NewsItems {
  _id: string
  title: string
  cid: number
  pdate: string
  notice: string
  ccount: number
}

export interface NewsDetail extends NewsItems {
  txt: string
}
