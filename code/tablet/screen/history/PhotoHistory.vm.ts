import { action, computed, makeObservable, observable, runInAction } from 'mobx'
import { HistoryItem } from './PhotoHistory.screen'
import { MMKVStorage } from '../../../core/storage/mmkv'
import { BaseViewModelProvider } from '../../provider/vm.provider'
import { SCREENS } from '../../navigation/navigation.types'
import { IComment, Users } from '../../../core/types/apiPhotoComment'
import ApiStore from '../../../core/store/Api.store'
import { savePhoto, sharePhoto } from '../../../core/utils/getPhoto'
import ApiService from '../../../core/api/apiService'
import { Alert } from 'react-native'

class PhotoHistoryVM extends BaseViewModelProvider<SCREENS.PHOTO_HISTORY> {
  @observable.ref photos: HistoryItem[] = []
  @observable selectedItem: string | null = null

  //photo detail
  @observable.ref comments: IComment[] = []
  @observable.ref users: Users | null = null
  @observable.ref postInfo: Photo | null = null
  @observable showLoader = false
  @observable isImageLoaded = false
  //
  constructor() {
    super()
    makeObservable(this)
  }
  // ------------------------------------------ Computed -----------------------------------------
  // photo detail
  @computed
  get imageLink() {
    return `https://img.pastvu.com/${ApiStore.photoQualitySettings}/${this.postInfo?.file}`
  }
  // ------------------------------------------ Actions ------------------------------------------

  @action.bound
  getPhotos() {
    this.photos = MMKVStorage.get('History') ?? []
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
  share() {
    sharePhoto(this.postInfo!.title, this.postInfo!.cid.toString())
  }

  @action.bound
  saveImage() {
    savePhoto(this.postInfo!.title, this.postInfo!.file)
  }
}

export default PhotoHistoryVM
