import { action, autorun, computed, makeObservable, observable, runInAction } from 'mobx'
import { SCREENS } from '../../../navigation/navigation.types'
import { Alert, Linking } from 'react-native'
import { BaseViewModelProvider } from '../../../provider/vm.provider'
import { IComment, Users } from '../../../../core/types/apiPhotoComment'
import ApiService from '../../../../core/api/apiService'
import { savePhoto, sharePhoto } from '../../../../core/utils/getPhoto'
import ApiStore from '../../../../core/store/Api.store'
import * as PhotoPost from '../../../../core/services/photoPost'
import { t } from '../../../../core/i18n'

class PhotoDetailVM extends BaseViewModelProvider<SCREENS.PHOTO_DETAIL> {
  @observable comments: IComment[] = []
  @observable users: Users | null = null
  @observable postInfo: Photo | null = null
  @observable isImageLoaded = false
  @observable isFavorite = false
  @observable activeCid: string | null = null
  @observable.ref cidHistory: string[] = []

  constructor() {
    super()
    makeObservable(this)
    autorun(() => {
      if (this.screenParams?.cid) {
        this.activeCid = this.screenParams.cid
        this.getPhotoInfo()
      }
    })
  }

  // ------------------------------------------ Computed ------------------------------------------

  @computed
  get imageLink() {
    return `https://img.pastvu.com/${ApiStore.photoQualitySettings}/${this.postInfo?.file}`
  }

  @computed
  get imageResolution() {
    return this.postInfo ? PhotoPost.photoResolution(this.postInfo) : undefined
  }

  @computed
  get canGoBack() {
    return this.cidHistory.length > 0
  }

  // ------------------------------------------ Actions ------------------------------------------

  @action.bound
  async getPhotoInfo() {
    const cid = this.activeCid!
    try {
      const { photo, users, comments } = await PhotoPost.loadPost(cid)
      // Another photo may have been opened while this request was in flight (comments link into
      // other posts). Without this the slower, older response would overwrite the newer one.
      if (this.activeCid !== cid) return
      runInAction(() => {
        this.postInfo = photo
        this.users = users
        this.comments = comments
        this.isFavorite = PhotoPost.isFavorite(cid)
      })
      PhotoPost.recordHistory(photo, cid)
    } catch {
      Alert.alert(t('common.error'), t('photo.infoError'))
    }
  }

  @action.bound
  openFullScreenImage() {
    this.navigateTo(SCREENS.FULL_SCREEN_IMAGE, {
      title: this.postInfo!.title,
      cid: this.activeCid!,
      uri: this.imageLink,
      file: this.postInfo!.file,
    })
  }

  @action.bound
  share() {
    sharePhoto(this.postInfo!.title, this.activeCid!)
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
    this.isFavorite = PhotoPost.toggleFavorite(this.postInfo!, this.activeCid!)
  }

  @action.bound
  async openPhotoFromLink(href: string) {
    const photoMatch = href.match(/\/p\/(\d+)/)
    const newsMatch = href.match(/\/news\/(\d+)/)
    if (photoMatch) {
      this.cidHistory = [...this.cidHistory, this.activeCid!]
      this.activeCid = photoMatch[1]
      this.isImageLoaded = false
      this.postInfo = null
      this.users = null
      this.comments = []
      this.getPhotoInfo()
    } else if (newsMatch) {
      try {
        const cid = Number(newsMatch[1])
        const news = await ApiService.getNews()
        const post = news.find((n: { cid: number }) => n.cid === cid)
        if (post) {
          this.navigateTo(SCREENS.NEWS_POST, post)
        } else {
          Linking.openURL(`https://pastvu.com/news/${cid}`)
        }
      } catch {
        Linking.openURL(`https://pastvu.com/news/${newsMatch[1]}`)
      }
    } else {
      Linking.openURL(href)
    }
  }

  @action.bound
  goBackToPhoto() {
    if (this.cidHistory.length === 0) return false
    const previousCid = this.cidHistory[this.cidHistory.length - 1]
    this.cidHistory = this.cidHistory.slice(0, -1)
    this.activeCid = previousCid
    this.isImageLoaded = false
    this.postInfo = null
    this.users = null
    this.comments = []
    this.getPhotoInfo()
    return true
  }
}

export default PhotoDetailVM
