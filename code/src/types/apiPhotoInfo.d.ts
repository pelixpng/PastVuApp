interface PhotoInfo {
	result: Result
	rid: string
}

interface Result {
	photo: Photo
	can: Can
	forEdit: boolean
}

interface Photo {
	type: number
	adate: string
	address: string
	album: number
	ccount: number
	cid: number
	desc: string
	dir: string
	file: string
	frags: Frag[]
	geo: number[]
	h: number
	hs: number
	ldate: string
	source: string
	title: string
	user: User
	vcount: number
	vdcount: number
	vwcount: number
	w: number
	ws: number
	year: number
	year2: number
	s: number
	y: string
	waterh: number
	waterhs: number
	cdate: string
	ucdate: string
	watersignCustom: string
	watersignIndividual: boolean
	watersignOption: boolean
	watersignText: string
	watersignTextApplied: string
	r2d: number[]
	regions: Region[]
	author: ?string
}

interface Frag {
	cid: number
	l: number
	t: number
	w: number
	h: number
}

interface User {
	login: string
	avatar: string
	disp: string
	ranks: string[]
	sex: string
}

interface Region {
	cid: number
	title_local: string
	phc: number
	pac: number
	cc: number
}

interface Can {
	download: string
}
