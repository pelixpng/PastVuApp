import { action, computed, makeObservable, observable, runInAction } from 'mobx'
import { Alert, Linking } from 'react-native'
import { BaseViewModelProvider } from '../../provider/vm.provider'
import { SCREENS } from '../../navigation/navigation.types'
import { SegmentedControlOption } from '../../../core/components/ui/segmentedControl/SegmentedControl'
import ApiService from '../../../core/api/apiService'
import ApiStore from '../../../core/store/Api.store'
import { MMKVStorage } from '../../../core/storage/mmkv'
import { NewsItems } from '../../../core/types/apiNews'
import { CollectionItem } from '../collection/Collection.screen'
import { IComment, Users } from '../../../core/types/apiPhotoComment'
import { getRegionPath } from '../../../core/utils/getRegionPath'
import { savePhoto, sharePhoto } from '../../../core/utils/getPhoto'

export type NewsTab = 'posts' | 'photos'

class NewsVM extends BaseViewModelProvider<SCREENS.NEWS> {
  @observable selectedTab: NewsTab = 'posts'
  @observable news: NewsItems[] = []
  @observable historyItems: CollectionItem[] = []
  @observable loading = true
  @observable selectedPostId: string | null = null

  // post detail
  @observable activePost: NewsItems | null = null
  @observable.ref postHistory: NewsItems[] = []
  @observable.ref postComments: IComment[] = []
  @observable.ref postUsers: Users | null = null

  // photo detail
  @observable.ref postInfo: Photo | null = null
  @observable.ref photoComments: IComment[] = []
  @observable.ref photoUsers: Users | null = null
  @observable selectedPhotoCid: string | null = null
  @observable showLoader = false
  @observable isImageLoaded = false
  @observable isFavorite = false

  private regionsMap: Map<number, any> = new Map()

  segmentOptions: SegmentedControlOption[] = [
    { label: 'Новости', value: 'posts' },
    { label: 'Фото', value: 'photos' },
  ]

  constructor() {
    super()
    makeObservable(this)
    this.loadRegions()
    this.loadNews()
    this.loadPhotos()
  }

  @computed
  get displayedPosts(): NewsItems[] {
    return this.news
  }

  @computed
  get displayedPhotos(): CollectionItem[] {
    return this.historyItems
  }

  @computed
  get canGoBack() {
    return this.postHistory.length > 0
  }

  @computed
  get imageLink() {
    return `https://img.pastvu.com/${ApiStore.photoQualitySettings}/${this.postInfo?.file}`
  }

  @action.bound
  setSelectedTab(tab: NewsTab) {
    this.selectedTab = tab
  }

  @action.bound
  async loadNews() {
    try {
      this.loading = true
      const newsData = await ApiService.getNews()
      runInAction(() => {
        this.news = newsData
        this.loading = false
      })
    } catch (error) {
      runInAction(() => {
        this.loading = false
      })
    }
  }

  @action.bound
  async loadPhotos() {
    try {
      const photosData = await ApiService.getRecentPhotos()
      runInAction(() => {
        this.historyItems = photosData.map((photo: any) => ({
          title: photo.title,
          description: `${photo.year}, ${getRegionPath(photo.rs, this.regionsMap)}`,
          cid: photo.cid.toString(),
          file: photo.file,
        }))
      })
    } catch (error) {
      console.log('Error loading photos:', error)
    }
  }

  @action.bound
  async loadRegions() {
    try {
      this.regionsMap = await ApiService.getRegions()
    } catch (error) {
      console.log('Error loading regions:', error)
    }
  }

  // -------------------------------- Post detail --------------------------------

  @action.bound
  openPost(post: NewsItems) {
    this.selectedPostId = post._id
    this.activePost = post
    this.postHistory = []
    this.postComments = []
    this.postUsers = null
    this.loadPostComments()
  }

  @action.bound
  async loadPostComments() {
    if (!this.activePost) return
    try {
      const { users, comments } = await ApiService.getNewsComments(this.activePost.cid)
      runInAction(() => {
        this.postUsers = users
        this.postComments = comments
      })
    } catch (error) {
      console.log('Error loading news comments:', error)
    }
  }

  @action.bound
  async openPhotoFromLink(href: string) {
    const photoMatch = href.match(/\/p\/(\d+)/)
    const newsMatch = href.match(/\/news\/(\d+)/)
    if (photoMatch) {
      this.showPhoto(photoMatch[1])
    } else if (newsMatch) {
      try {
        const cid = Number(newsMatch[1])
        const post = this.news.find(n => n.cid === cid)
        if (post) {
          this.postHistory = [...this.postHistory, this.activePost!]
          this.activePost = post
          this.postComments = []
          this.postUsers = null
          this.loadPostComments()
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
  goBackToPost() {
    if (this.postHistory.length === 0) return false
    const previousPost = this.postHistory[this.postHistory.length - 1]
    this.postHistory = this.postHistory.slice(0, -1)
    this.activePost = previousPost
    this.postComments = []
    this.postUsers = null
    this.loadPostComments()
    return true
  }

  // -------------------------------- Photo detail --------------------------------

  @action.bound
  showPhoto(cid: string) {
    if (cid !== this.postInfo?.cid.toString()) {
      if (this.postInfo) {
        runInAction(() => {
          this.postInfo = null
          this.photoComments = []
          this.photoUsers = null
          this.isImageLoaded = false
        })
      } else {
        this.showLoader = true
      }
      this.selectedPhotoCid = cid
      this.getPhotoInfo(cid)
    }
  }

  @action.bound
  async getPhotoInfo(cid: string) {
    await ApiService.getPhotoInfo(cid)
      .then(async ({ result }) => {
        runInAction(() => {
          this.postInfo = result.photo
          const favorites: CollectionItem[] = MMKVStorage.get('Favorites') ?? []
          this.isFavorite = favorites.some(item => item.cid === cid)
        })
        if (result.photo?.ccount) {
          this.getPhotoComments(cid)
        }
      })
      .catch(() => Alert.alert('Ошибка', 'Не удалось загрузить информацию о фото'))
  }

  @action.bound
  async getPhotoComments(cid: string) {
    await ApiService.getComments(cid).then(({ users, comments }) => {
      runInAction(() => {
        this.photoUsers = users
        this.photoComments = comments
      })
    })
  }

  @action.bound
  onImageLoad() {
    this.isImageLoaded = true
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
      this.isFavorite = false
    } else {
      MMKVStorage.set('Favorites', [{ title, description, cid, file }, ...favorites])
      this.isFavorite = true
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

export default NewsVM