import { action, makeObservable, observable } from 'mobx'
import { BaseViewModelProvider } from '../../../store/vm.provider'
import { SCREENS } from '../../../navigation/navigation.types'
import { MMKVStorage } from '../../../storage/mmkv'
import { HistoryItem } from './PhotoHistory.screen'

class PhotoHistoryVM extends BaseViewModelProvider<SCREENS.PHOTO_HISTORY> {
  @observable.ref photos: HistoryItem[] = []
  constructor() {
    super()
    makeObservable(this)
  }
  // ------------------------------------------ Computed ------------------------------------------
  // ------------------------------------------ Actions ------------------------------------------

  @action.bound
  getPhotos() {
    this.photos = MMKVStorage.get('History') ?? []
  }

  @action.bound
  openPhoto(cid: string, title: string) {
    this.navigateTo(SCREENS.PHOTO_DETAIL, { cid: cid, title: title })
  }
}

export default PhotoHistoryVM
