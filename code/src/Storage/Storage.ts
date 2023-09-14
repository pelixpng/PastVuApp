import { MMKV } from 'react-native-mmkv'
import { Region } from 'react-native-maps'
export const Storage = new MMKV()

export default class StorageServiceMMKV {
	static clearData = () => {
		Storage.clearAll()
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

	static saveYearsRange = (RangeYears: YearsRangeType) => {
		const stringifiedArray = JSON.stringify(RangeYears)
		Storage.set('RangeYears', stringifiedArray)
	}

	static saveRegion = (Region: Region) => {
		const RegionString = JSON.stringify(Region)
		Storage.set('RegionString', RegionString)
	}
}
