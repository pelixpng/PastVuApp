import { MMKV } from 'react-native-mmkv'

type MMKVStorageType =
  | 'qualityPhoto' //done
  | 'themeApp' //done
  | 'countPhoto'
  | 'MaxDistance'
  | 'MaxPhoto'
  | 'mapType' //done
  | 'markerType' //done
  | 'RangeYears'
  | 'RegionString'
  | 'History'
  | 'mapProvider'
  | 'isShowCluster' //done

type TValue = string | number | object

export const mmkv = new MMKV()

const setToMMKVStorage = (key: MMKVStorageType, data: TValue) => {
  const value = typeof data === 'object' ? JSON.stringify(data) : data
  mmkv.set(key, value)
}

const getFromMMKVStorage = (key: MMKVStorageType) => {
  const numberKeys = ['MaxDistance', 'MaxPhoto', 'countPhoto']
  if (numberKeys.includes(key)) return mmkv.getNumber(key)
  const storeValue = mmkv.getString(key)
  return storeValue && (storeValue?.startsWith('{') || storeValue?.startsWith('['))
    ? JSON.parse(storeValue)
    : storeValue
}

export const MMKVStorage = {
  get: getFromMMKVStorage,
  set: setToMMKVStorage,
}
