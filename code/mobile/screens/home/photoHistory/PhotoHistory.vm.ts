import { action, computed, makeObservable, observable } from 'mobx'
import { SCREENS } from '../../../navigation/navigation.types'
import { HistoryItem } from './PhotoHistory.screen'
import { BaseViewModelProvider } from '../../../provider/vm.provider'
import { MMKVStorage } from '../../../../core/storage/mmkv'
import { SegmentedControlOption } from '../../../../core/components/ui/segmentedControl/SegmentedControl'

export type CollectionTab = 'favorites' | 'viewed'

class PhotoHistoryVM extends BaseViewModelProvider<SCREENS.PHOTO_HISTORY> {
  @observable.ref photos: HistoryItem[] = []
  @observable.ref favorites: HistoryItem[] = []
  @observable selectedTab: CollectionTab = 'viewed'

  segmentOptions: SegmentedControlOption[] = [
    { label: 'Избранное', value: 'favorites' },
    { label: 'Просмотренное', value: 'viewed' },
  ]

  constructor() {
    super()
    makeObservable(this)
  }
  // ------------------------------------------ Computed ------------------------------------------
  @computed
  get displayedData(): HistoryItem[] {
    return this.selectedTab === 'viewed' ? this.photos : this.favorites
  }

  // ------------------------------------------ Actions ------------------------------------------

  @action.bound
  getPhotos() {
    this.photos = MMKVStorage.get('History') ?? []
  }

  @action.bound
  setSelectedTab(tab: CollectionTab) {
    this.selectedTab = tab
  }

  @action.bound
  openPhoto(cid: string, title: string) {
    this.navigateTo(SCREENS.PHOTO_DETAIL, { cid: cid, title: title })
  }
}

export default PhotoHistoryVM
