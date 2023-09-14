import { makeAutoObservable } from 'mobx'
import StorageServiceMMKV, { Storage } from '../Storage/Storage'

class ThemeStore {
	themeSettings = Storage.getString('theme') ?? 'Системная'
	theme = ''

	constructor() {
		makeAutoObservable(this)
	}

	changeThemeSettings = (value: string) => {
		this.themeSettings = value
		value != 'Системная' && this.changeTheme(value)
		StorageServiceMMKV.saveThemeSettings(value)
	}

	changeTheme = (value: string) => {
		this.theme = value
	}
}

export default new ThemeStore()
