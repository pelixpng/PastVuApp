import { action, computed, makeObservable, observable } from 'mobx'
import { SCREENS } from '../../../navigation/navigation.types'
import { CollectionItem } from './Collection.screen'
import { BaseViewModelProvider } from '../../../provider/vm.provider'
import { MMKVStorage } from '../../../../core/storage/mmkv'
import { SegmentedControlOption } from '../../../../core/components/ui/segmentedControl/SegmentedControl'

export type CollectionTab = 'favorites' | 'viewed'

class CollectionVM extends BaseViewModelProvider<SCREENS.PHOTO_HISTORY> {
  @observable.ref photos: CollectionItem[] = []
  @observable.ref favorites: CollectionItem[] = []
  @observable selectedTab: CollectionTab = 'favorites'
  @observable isDeleteModalVisible = false
  @observable pendingDeleteCid: string | null = null

  segmentOptions: SegmentedControlOption[] = [
    { label: 'Избранное', value: 'favorites' },
    { label: 'Просмотренн', value: 'viewed' },
  ]

  constructor() {
    super()
    makeObservable(this)
  }
  // ------------------------------------------ Computed ------------------------------------------
  @computed
  get displayedData(): CollectionItem[] {
    return this.selectedTab === 'viewed' ? this.photos : this.favorites
  }

  @computed
  get deleteConfirmationTitle(): string {
    return this.selectedTab === 'viewed'
      ? 'Удалить запись из истории?'
      : 'Удалить запись из избранного?'
  }

  // ------------------------------------------ Actions ------------------------------------------

  @action.bound
  getPhotos() {
    this.photos = MMKVStorage.get('History') ?? []
    this.favorites = MMKVStorage.get('Favorites') ?? []
  }

  @action.bound
  setSelectedTab(tab: CollectionTab) {
    this.selectedTab = tab
  }

  @action.bound
  openPhoto(cid: string, title: string) {
    this.navigateTo(SCREENS.PHOTO_DETAIL, { cid: cid, title: title })
  }

  @action.bound
  showDeleteConfirmation(cid: string) {
    this.pendingDeleteCid = cid
    this.isDeleteModalVisible = true
  }

  @action.bound
  hideDeleteConfirmation() {
    this.isDeleteModalVisible = false
    this.pendingDeleteCid = null
  }

  @action.bound
  confirmDelete() {
    if (!this.pendingDeleteCid) return

    if (this.selectedTab === 'viewed') {
      this.photos = this.photos.filter(photo => photo.cid !== this.pendingDeleteCid)
      MMKVStorage.set('History', this.photos)
    } else {
      this.favorites = this.favorites.filter(photo => photo.cid !== this.pendingDeleteCid)
      MMKVStorage.set('Favorites', this.favorites)
    }
    this.hideDeleteConfirmation()
  }
}

export default CollectionVM
