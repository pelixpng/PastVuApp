import { action, autorun, computed, makeObservable, observable } from 'mobx'
import { SCREENS } from '../../../navigation/navigation.types'
import { HistoryItem } from '../photoHistory/PhotoHistory.screen'
import { Alert } from 'react-native'
import { ExtensionStorage } from '@bacons/apple-targets'
import { BaseViewModelProvider } from '../../../provider/vm.provider'
import { IComment, Users } from '../../../../core/types/apiPhotoComment'
import ApiService from '../../../../core/api/apiService'
import { MMKVStorage } from '../../../../core/storage/mmkv'
import { IosTargetStorage } from '../../../../core/storage/appleTarget'
import { savePhoto, sharePhoto } from '../../../../core/utils/getPhoto'
import ApiStore from '../../../../core/store/Api.store'

class PhotoDetailVM extends BaseViewModelProvider<SCREENS.PHOTO_DETAIL> {
  @observable comments: IComment[] = []
  @observable users: Users | null = null
  @observable postInfo: Photo | null = null
  @observable isImageLoaded = false
  @observable isFavorite = false

  constructor() {
    super()
    makeObservable(this)
    autorun(() => {
      this.screenParams?.cid && this.getPhotoInfo()
    })
  }

  // ------------------------------------------ Computed ------------------------------------------

  @computed
  get imageLink() {
    return `https://img.pastvu.com/${ApiStore.photoQualitySettings}/${this.postInfo?.file}`
  }

  // ------------------------------------------ Actions ------------------------------------------

  @action.bound
  async getPhotoInfo() {
    await ApiService.getPhotoInfo(this.screenParams.cid)
      .then(async ({ result }) => {
        this.postInfo = result.photo
        const cid = this.screenParams.cid
        const history: HistoryItem[] = MMKVStorage.get('History') ?? []
        const title = result.photo.title
        const description = `${result.photo.y} ${result.photo.regions
          .map(region => region.title_local)
          .join(', ')}`
        const file = result.photo.file
        if (!history.some(item => item.cid === cid)) {
          MMKVStorage.set('History', [{ title, description, cid, file }, ...history])
          IosTargetStorage.set(
            'History',
            JSON.stringify([{ title, description, cid, file }, ...history]),
          )
          ExtensionStorage.reloadWidget()
        }
        // Проверяем, есть ли фото в избранном
        const favorites: HistoryItem[] = MMKVStorage.get('Favorites') ?? []
        this.isFavorite = favorites.some(item => item.cid === cid)

        if (result.photo?.ccount) {
          this.getComments()
        }
      })
      .catch(() => Alert.alert('Ошибка', 'Не удалось загрузить информацию о фото'))
  }

  @action.bound
  async getComments() {
    await ApiService.getComments(this.screenParams.cid).then(({ users, comments }) => {
      this.users = users
      this.comments = comments
    })
  }

  @action.bound
  openFullScreenImage() {
    this.navigateTo(SCREENS.FULL_SCREEN_IMAGE, {
      title: this.postInfo!.title,
      cid: this.screenParams.cid,
      uri: this.imageLink,
      file: this.postInfo!.file,
    })
  }

  @action.bound
  share() {
    sharePhoto(this.postInfo!.title, this.screenParams.cid)
  }

  @action.bound
  saveImage() {
    savePhoto(this.postInfo!.title, this.postInfo!.file)
  }

  @action.bound
  onImageLoad() {
    this.isImageLoaded = true
  }

  @action.bound
  toggleFavorite() {
    const cid = this.screenParams.cid
    const favorites: HistoryItem[] = MMKVStorage.get('Favorites') ?? []
    const title = this.postInfo!.title
    const description = `${this.postInfo!.y} ${this.postInfo!.regions
      .map(region => region.title_local)
      .join(', ')}`
    const file = this.postInfo!.file

    if (this.isFavorite) {
      // Удаляем из избранного
      const updatedFavorites = favorites.filter(item => item.cid !== cid)
      MMKVStorage.set('Favorites', updatedFavorites)
      this.isFavorite = false
    } else {
      // Добавляем в избранное
      MMKVStorage.set('Favorites', [{ title, description, cid, file }, ...favorites])
      this.isFavorite = true
    }
  }
}

export default PhotoDetailVM
