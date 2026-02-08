import { action, autorun, computed, makeObservable, observable } from 'mobx'
import { SCREENS } from '../../../navigation/navigation.types'
import { CollectionItem } from '../collection/Collection.screen'
import { Alert, Linking } from 'react-native'
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
  get canGoBack() {
    return this.cidHistory.length > 0
  }

  // ------------------------------------------ Actions ------------------------------------------

  @action.bound
  async getPhotoInfo() {
    await ApiService.getPhotoInfo(this.activeCid!)
      .then(async ({ result }) => {
        this.postInfo = result.photo
        const cid = this.activeCid!
        const history: CollectionItem[] = MMKVStorage.get('History') ?? []
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
        const favorites: CollectionItem[] = MMKVStorage.get('Favorites') ?? []
        this.isFavorite = favorites.some(item => item.cid === cid)

        if (result.photo?.ccount) {
          this.getComments()
        }
      })
      .catch(() => Alert.alert('Ошибка', 'Не удалось загрузить информацию о фото'))
  }

  @action.bound
  async getComments() {
    await ApiService.getComments(this.activeCid!).then(({ users, comments }) => {
      this.users = users
      this.comments = comments
    })
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
    const cid = this.activeCid!
    const favorites: CollectionItem[] = MMKVStorage.get('Favorites') ?? []
    const title = this.postInfo!.title
    const description = `${this.postInfo!.y} ${this.postInfo!.regions.map(
      region => region.title_local,
    ).join(', ')}`
    const file = this.postInfo!.file

    if (this.isFavorite) {
      const updatedFavorites = favorites.filter(item => item.cid !== cid)
      MMKVStorage.set('Favorites', updatedFavorites)
      this.isFavorite = false
    } else {
      MMKVStorage.set('Favorites', [{ title, description, cid, file }, ...favorites])
      this.isFavorite = true
    }
  }

  @action.bound
  async openPhotoFromLink(href: string) {
    const photoMatch = href.match(/\/p\/(\d+)/)
    const newsMatch = href.match(/\/news\/(\d+)/)
    if (photoMatch) {
      this.cidHistory = [...this.cidHistory, this.activeCid!]
      this.activeCid = photoMatch[1]
      this.isImageLoaded = false
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
    this.comments = []
    this.getPhotoInfo()
    return true
  }
}

export default PhotoDetailVM
