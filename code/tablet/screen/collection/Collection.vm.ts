import { action, computed, makeObservable, observable, runInAction } from 'mobx'
import { CollectionItem } from './Collection.screen'
import { MMKVStorage } from '../../../core/storage/mmkv'
import { BaseViewModelProvider } from '../../provider/vm.provider'
import { SCREENS } from '../../navigation/navigation.types'
import { IComment, Users } from '../../../core/types/apiPhotoComment'
import ApiStore from '../../../core/store/Api.store'
import { savePhoto, sharePhoto } from '../../../core/utils/getPhoto'
import * as PhotoPost from '../../../core/services/photoPost'
import { Alert, Linking } from 'react-native'
import { SegmentedControlOption } from '../../../core/components/ui/segmentedControl/SegmentedControl'
import { t } from '../../../core/i18n'

export type CollectionTab = 'favorites' | 'viewed'

class CollectionVM extends BaseViewModelProvider<SCREENS.PHOTO_HISTORY> {
  @observable.ref photos: CollectionItem[] = []
  @observable.ref favorites: CollectionItem[] = []
  @observable selectedTab: CollectionTab = 'favorites'
  @observable selectedItem: string | null = null
  @observable isDeleteModalVisible = false
  @observable pendingDeleteCid: string | null = null

  //photo detail
  @observable.ref comments: IComment[] = []
  @observable.ref users: Users | null = null
  @observable.ref postInfo: Photo | null = null
  @observable showLoader = false
  @observable isImageLoaded = false
  @observable isFavorite = false

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

  // photo detail
  @computed
  get imageLink() {
    return `https://img.pastvu.com/${ApiStore.photoQualitySettings}/${this.postInfo?.file}`
  }

  @computed
  get imageResolution() {
    return this.postInfo ? PhotoPost.photoResolution(this.postInfo) : undefined
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
    this.pendingDeleteCid = cid ?? this.postInfo?.cid.toString() ?? null
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
      MMKVStorage.set('History', this.photos)
    } else {
      this.favorites = this.favorites.filter(photo => photo.cid !== this.pendingDeleteCid)
      MMKVStorage.set('Favorites', this.favorites)
      if (this.postInfo?.cid.toString() === this.pendingDeleteCid) {
        this.isFavorite = false
      }
    }
    this.hideDeleteModal()
  }

  @action.bound
  showPhoto(cid: string) {
    if (cid !== this.postInfo?.cid.toString()) {
      if (this.postInfo) {
        runInAction(() => {
          this.postInfo = null
          this.comments = []
          this.users = null
          this.isImageLoaded = false
        })
      } else {
        this.showLoader = true
      }
      this.selectedItem = cid
      this.getPhotoInfo(cid)
    }
  }

  @action.bound
  async getPhotoInfo(cid: string) {
    try {
      const { photo, users, comments } = await PhotoPost.loadPost(cid)
      // Another photo may have been selected while this request was in flight; without this the
      // slower, older response would overwrite the newer one.
      if (this.selectedItem !== cid) return
      const updatedHistory = PhotoPost.recordHistory(photo, cid, this.photos)
      runInAction(() => {
        this.postInfo = photo
        this.users = users
        this.comments = comments
        this.isFavorite = PhotoPost.isFavorite(cid)
        this.photos = updatedHistory
      })
    } catch {
      Alert.alert(t('common.error'), t('photo.infoError'))
    }
  }

  @action.bound
  openFullScreenImage() {
    this.navigateTo(SCREENS.FULL_SCREEN_IMAGE, {
      title: this.postInfo!.title,
      cid: this.postInfo!.cid.toString(),
      uri: this.imageLink,
      file: this.postInfo!.file,
    })
  }

  @action.bound
  onImageLoad() {
    this.isImageLoaded = true
  }

  @action.bound
  toggleFavorite() {
    const cid = this.postInfo!.cid.toString()
    const favorites: CollectionItem[] = MMKVStorage.get('Favorites') ?? []
    const title = this.postInfo!.title
    const description = `${this.postInfo!.y} ${this.postInfo!.regions
      .map(region => region.title_local)
      .join(', ')}`
    const file = this.postInfo!.file

    if (this.isFavorite) {
      const updatedFavorites = favorites.filter(item => item.cid !== cid)
      MMKVStorage.set('Favorites', updatedFavorites)
      this.favorites = updatedFavorites
      this.isFavorite = false
    } else {
      const updatedFavorites = [{ title, description, cid, file }, ...favorites]
      MMKVStorage.set('Favorites', updatedFavorites)
      this.favorites = updatedFavorites
      this.isFavorite = true
    }
  }

  @action.bound
  openPhotoFromLink(href: string) {
    const photoMatch = href.match(/\/p\/(\d+)/)
    if (photoMatch) {
      this.showPhoto(photoMatch[1])
    } else {
      Linking.openURL(href)
    }
  }

  @action.bound
  share() {
    sharePhoto(this.postInfo!.title, this.postInfo!.cid.toString())
  }

  @action.bound
  saveImage() {
    savePhoto(this.postInfo!.title, this.postInfo!.file)
  }
}

export default CollectionVM