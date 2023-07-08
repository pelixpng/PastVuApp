//ИНТЕРФЕЙС ДЛЯ ПОЛУЧЕНИЯ СПИСКА ФОТОК В РЕГИОНЕ
export interface getPhotoList {
    result: Result
    rid: string
  }
  
  export interface Result {
    photos: Photo[]
  }
  
  export interface Photo {
    cid: number
    file: string
    s: number
    year: number
    title: string
    dir?: string
    geo: number[]
    ccount?: number
  }