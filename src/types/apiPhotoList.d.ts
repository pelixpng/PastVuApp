//ИНТЕРФЕЙС ДЛЯ ПОЛУЧЕНИЯ СПИСКА ФОТОК В РЕГИОНЕ
interface getPhotoList {
	result: Result
	rid: string
}

interface Result {
	photos: Photo[]
}

interface Photo {
	cid: number
	file: string
	s: number
	year: number
	title: string
	dir?: string
	geo: number[]
	ccount?: number
}
