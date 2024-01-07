import { MMKV } from 'react-native-mmkv'
import { Region } from 'react-native-maps'

export interface HistoryItem {
	title: string
	description: string
	cid: string
	file: string
}

export const Storage = new MMKV()

export default class StorageServiceMMKV {
	static clearData = () => {
		Storage.clearAll()
	}

	static savePhotoQualitySettings = (photoQuality: string) => {
		Storage.set('photoQuality', photoQuality)
	}

	static saveThemeSettings = (themeSettings: string) => {
		Storage.set('theme', themeSettings)
	}

	static saveApiCountPhoto = (countPhoto: number) => {
		Storage.set('countPhoto', countPhoto)
	}

	static saveApiMaxDistance = (MaxDistance: number) => {
		Storage.set('MaxDistance', MaxDistance)
	}

	static saveMaxPhotoOnMap = (MaxPhoto: number) => {
		Storage.set('MaxPhoto', MaxPhoto)
	}

	static saveYearsRange = (RangeYears: YearsRangeType) => {
		const stringifiedArray = JSON.stringify(RangeYears)
		Storage.set('RangeYears', stringifiedArray)
	}

	static saveRegion = (Region: Region) => {
		const RegionString = JSON.stringify(Region)
		Storage.set('RegionString', RegionString)
	}

	//это все оптимизировать
	//проверить
	static saveHistory = (
		cid: string,
		title: string,
		description: string,
		file: string
	) => {
		const historyString = Storage.getString('History') ?? '[]'
		const parseArr: HistoryItem[] = JSON.parse(historyString)
		parseArr.unshift({
			title: title,
			description: description,
			cid: cid,
			file: file
		})
		parseArr.length >= 400 && parseArr.splice(-200, 200)
		const history = JSON.stringify(parseArr)
		Storage.set('History', history)
	}
}
