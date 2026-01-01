import { action, makeObservable, observable } from 'mobx'
import { MMKVStorage } from '../storage/mmkv'

class ApiStore {
  @observable photoQualitySettings = MMKVStorage.get('qualityPhoto') ?? 'a'
  @observable requestCountPhoto = MMKVStorage.get('countPhoto') ?? 30
  @observable maxDistance = MMKVStorage.get('MaxDistance') ?? 7000
  @observable showCluster = MMKVStorage.get('isShowCluster') ?? 'yes'

  constructor() {
    makeObservable(this)
  }

  @action.bound
  setPhotoQuality = (value: string) => {
    this.photoQualitySettings = value
    MMKVStorage.set('qualityPhoto', value)
  }

  @action.bound
  setRequestCountPhoto = (value: number[]) => {
    this.requestCountPhoto = value[0]
    MMKVStorage.set('countPhoto', value[0])
  }

  @action.bound
  setMaxDistancePhoto = (value: number[]) => {
    this.maxDistance = value[0]
    MMKVStorage.set('MaxDistance', value[0])
  }

  @action.bound
  setShowCluster = (value: string) => {
    this.showCluster = value
    MMKVStorage.set('isShowCluster', value)
  }
}

export default new ApiStore()
