import { action, computed, makeObservable, observable } from 'mobx'
import type { CollectionItem } from '../../../core/services/photoPost'
import { MMKVStorage } from '../../../core/storage/mmkv'
import { BaseViewModelProvider } from '../../provider/vm.provider'
import { SCREENS } from '../../navigation/navigation.types'
import { userLoginFromLink } from '../../../core/utils/userLink'
import { PhotoPanel } from '../../../core/store/PhotoPanel'
import * as PhotoPost from '../../../core/services/photoPost'
import { Linking } from 'react-native'
import { SegmentedControlOption } from '../../../core/components/ui/segmentedControl/SegmentedControl'
import { t } from '../../../core/i18n'

export type CollectionTab = 'favorites' | 'viewed'

// Generic over the screen so a subclass on another screen (the profile) gets its own route params.
class CollectionVM<SCREEN extends SCREENS = SCREENS.PHOTO_HISTORY> extends BaseViewModelProvider<SCREEN> {
  @observable.ref photos: CollectionItem[] = []
  @observable.ref favorites: CollectionItem[] = []
  @observable selectedTab: CollectionTab = 'favorites'
  @observable isDeleteModalVisible = false
  @observable pendingDeleteCid: string | null = null

  /** The photo picked in the list; opening one puts it at the top of the history shown here. */
  readonly panel = new PhotoPanel({
    openFullScreen: params => this.navigateTo(SCREENS.FULL_SCREEN_IMAGE, params),
    onHistory: history => {
      this.photos = history
    },
  })

  // A getter, not a field: a field is evaluated once when the view model is constructed and
  // would keep the language that was active back then.
  @computed
  get segmentOptions(): SegmentedControlOption[] {
    return [
      { label: t('collection.favorites'), value: 'favorites' },
      { label: t('collection.recent'), value: 'viewed' },
    ]
  }

  constructor() {
    super()
    makeObservable(this)
  }
  // ------------------------------------------ Computed -----------------------------------------
  @computed
  get displayedData(): CollectionItem[] {
    return this.selectedTab === 'viewed' ? this.photos : this.favorites
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
  showDeleteModal(cid?: string) {
    this.pendingDeleteCid = cid ?? this.panel.postInfo?.cid.toString() ?? null
    this.isDeleteModalVisible = true
  }

  @action.bound
  hideDeleteModal() {
    this.isDeleteModalVisible = false
    this.pendingDeleteCid = null
  }

  @computed
  get deleteConfirmationTitle(): string {
    return this.selectedTab === 'viewed'
      ? t('collection.removeFromHistory')
      : t('collection.removeFromFavorites')
  }

  @action.bound
  confirmDelete() {
    if (!this.pendingDeleteCid) return
    if (this.selectedTab === 'viewed') {
      this.photos = this.photos.filter(photo => photo.cid !== this.pendingDeleteCid)
      PhotoPost.saveHistory(this.photos)
    } else {
      this.favorites = this.favorites.filter(photo => photo.cid !== this.pendingDeleteCid)
      MMKVStorage.set('Favorites', this.favorites)
      if (this.panel.postInfo?.cid.toString() === this.pendingDeleteCid) {
        this.panel.isFavorite = false
      }
    }
    this.hideDeleteModal()
  }

  @action.bound
  showPhoto(cid: string) {
    this.panel.select(cid)
  }

  @action.bound
  toggleFavorite() {
    this.panel.toggleFavorite()
    // The favourites tab follows at once.
    this.favorites = MMKVStorage.get('Favorites') ?? []
  }

  @action.bound
  openPhotoFromLink(href: string) {
    const photoMatch = href.match(/\/p\/(\d+)/)
    if (photoMatch) {
      this.showPhoto(photoMatch[1])
    } else {
      const login = userLoginFromLink(href)
      if (login) {
        this.pushTo(SCREENS.PROFILE, { login })
      } else {
        Linking.openURL(href)
      }
    }
  }
}

export default CollectionVM