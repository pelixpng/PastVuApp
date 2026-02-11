import { action, computed, makeObservable, observable, runInAction } from 'mobx'
import { Alert, Linking } from 'react-native'
import { BaseViewModelProvider } from '../../provider/vm.provider'
import { SCREENS } from '../../navigation/navigation.types'
import { SegmentedControlOption } from '../../../core/components/ui/segmentedControl/SegmentedControl'
import ApiService from '../../../core/api/apiService'
import { NewsItems } from '../../../core/types/apiNews'
import { CollectionItem } from '../collection/Collection.screen'
import { IComment, Users } from '../../../core/types/apiPhotoComment'
import { getRegionPath } from '../../../core/utils/getRegionPath'

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
  @observable.ref comments: IComment[] = []
  @observable.ref users: Users | null = null

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

  @action.bound
  openPost(post: NewsItems) {
    this.selectedPostId = post._id
    this.activePost = post
    this.postHistory = []
    this.comments = []
    this.users = null
    this.loadComments()
  }

  @action.bound
  async loadComments() {
    if (!this.activePost) return
    try {
      const { users, comments } = await ApiService.getNewsComments(this.activePost.cid)
      runInAction(() => {
        this.users = users
        this.comments = comments
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
      this.navigateTo(SCREENS.FULL_SCREEN_IMAGE, {
        cid: photoMatch[1],
        title: `#${photoMatch[1]}`,
        uri: `https://img.pastvu.com/p/${photoMatch[1]}`,
        file: '',
      })
    } else if (newsMatch) {
      try {
        const cid = Number(newsMatch[1])
        const post = this.news.find(n => n.cid === cid)
        if (post) {
          this.postHistory = [...this.postHistory, this.activePost!]
          this.activePost = post
          this.comments = []
          this.users = null
          this.loadComments()
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
    this.comments = []
    this.users = null
    this.loadComments()
    return true
  }

  @action.bound
  openPhoto(cid: string) {
    this.navigateTo(SCREENS.MAP, { cid })
  }
}

export default NewsVM