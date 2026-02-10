import { action, computed, makeObservable, observable, runInAction } from 'mobx'
import { CollectionItem } from './Collection.screen'
import { MMKVStorage } from '../../../core/storage/mmkv'
import { BaseViewModelProvider } from '../../provider/vm.provider'
import { SCREENS } from '../../navigation/navigation.types'
import { IComment, Users } from '../../../core/types/apiPhotoComment'
import ApiStore from '../../../core/store/Api.store'
import { savePhoto, sharePhoto } from '../../../core/utils/getPhoto'
import ApiService from '../../../core/api/apiService'
import { Alert, Linking } from 'react-native'
import { SegmentedControlOption } from '../../../core/components/ui/segmentedControl/SegmentedControl'

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

  segmentOptions: SegmentedControlOption[] = [
    { label: 'Избранное', value: 'favorites' },
    { label: 'Недавние', value: 'viewed' },
  ]

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
      ? 'Удалить запись из истории?'
      : 'Удалить запись из избранного?'
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
    await ApiService.getPhotoInfo(cid)
      .then(async ({ result }) => {
        this.postInfo = result.photo
        const favorites: CollectionItem[] = MMKVStorage.get('Favorites') ?? []
        this.isFavorite = favorites.some(item => item.cid === cid)
        const title = result.photo.title
        const description = `${result.photo.y} ${result.photo.regions
          .map(region => region.title_local)
          .join(', ')}`
        const file = result.photo.file
        if (!this.photos.some(item => item.cid === cid)) {
          const updatedHistory = [{ title, description, cid, file }, ...this.photos]
          MMKVStorage.set('History', updatedHistory)
          this.photos = updatedHistory
        }
        if (result.photo?.ccount) {
          this.getComments(cid)
        }
      })
      .catch(() => Alert.alert('Ошибка', 'Не удалось загрузить информацию о фото'))
  }

  @action.bound
  async getComments(cid: string) {
    await ApiService.getComments(cid).then(({ users, comments }) => {
      runInAction(() => {
        this.users = users
        this.comments = comments
      })
    })
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