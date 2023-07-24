import { MMKV } from 'react-native-mmkv'

export const Storage = new MMKV()

export default class StorageServiceMMKV{
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
        const stringifiedArray = JSON.stringify(RangeYears);
        Storage.set('RangeYears', stringifiedArray)
    }
}