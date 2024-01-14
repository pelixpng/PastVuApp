import { MMKV } from 'react-native-mmkv'
import { Region } from 'react-native-maps'
import { YearsRangeType } from '../types/components'
import { Image } from 'expo-image'

export interface HistoryItem {
	title: string
	description: string
	cid: string
	file: string
}

export const Storage = new MMKV()

export default class StorageServiceMMKV {
	static saveLaunchStatus = (launchStatus: boolean) => {
		Storage.clearAll()
		Storage.set('launchStatus', launchStatus)
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

	static saveTypeMap = (TypeMap: string) => {
		Storage.set('TypeMap', TypeMap)
	}

	static saveYearsRange = (RangeYears: YearsRangeType) => {
		Storage.set('RangeYears', JSON.stringify(RangeYears))
	}

	static saveRegion = (Region: Region) => {
		Storage.set('RegionString', JSON.stringify(Region))
	}

	static saveHistory = async (
		cid: string,
		title: string,
		description: string,
		file: string
	) => {
		const historyString = Storage.getString('History') ?? '[]'
		const parseArr: HistoryItem[] = JSON.parse(historyString)
		if (!parseArr.some(obj => obj.cid === cid)) {
			parseArr.unshift({ title, description, cid, file })
			if (parseArr.length >= 400) {
				parseArr.splice(-200, 200)
				await Image.clearDiskCache()
			}
			Storage.set('History', JSON.stringify(parseArr))
		}
	}
}
