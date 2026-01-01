import { action, makeObservable, observable } from 'mobx'
import { SCREENS } from '../../../navigation/navigation.types'
import { HistoryItem } from './PhotoHistory.screen'
import { BaseViewModelProvider } from '../../../provider/vm.provider'
import { MMKVStorage } from '../../../../core/storage/mmkv'

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
