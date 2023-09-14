export interface IComments {
	result: Result
	rid: string
}

export interface Result {
	comments: IComment[]
	countTotal: number
	users: Users
	cid: number
}

export interface IComment {
	cid: number
	user: string
	txt: string
	s: number
	type: number
	stamp: number
	parent?: number
	level: number
	comments?: ReplayComment[]
}

export interface ReplayComment {
	cid: number
	user: string
	txt: string
	parent: number
	level: number
	s: number
	type: number
	stamp: number
	comments?: ReplayComment[]
}

export interface Users {
	[key: string]: User
}

export interface User {
	avatar: string
	disp: string
	login: string
	ranks: string[]
	online: boolean
}
