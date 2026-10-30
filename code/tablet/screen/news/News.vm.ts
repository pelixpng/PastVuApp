import { action, computed, makeObservable, observable, runInAction } from 'mobx'
import { Linking, Share } from 'react-native'
import { BaseViewModelProvider } from '../../provider/vm.provider'
import { SCREENS } from '../../navigation/navigation.types'
import { SegmentedControlOption } from '../../../core/components/ui/segmentedControl/SegmentedControl'
import ApiService from '../../../core/api/apiService'
import { userLoginFromLink } from '../../../core/utils/userLink'
import { NewsItems } from '../../../core/types/apiNews'
import type { CollectionItem } from '../../../core/services/photoPost'
import { IComment, Users } from '../../../core/types/apiPhotoComment'
import { getRegionPath } from '../../../core/utils/getRegionPath'
import { loadNews, savedNews } from '../../../core/services/news'
import { PhotoPanel } from '../../../core/store/PhotoPanel'
import { t } from '../../../core/i18n'

export type NewsTab = 'posts' | 'photos'

class NewsVM extends BaseViewModelProvider<SCREENS.NEWS> {
  @observable selectedTab: NewsTab = 'posts'
  /**
   * The feed kept from the last visit shows at once; the fresh one replaces it. A reference: the
   * feed is replaced whole, never edited, so its 154 posts need no deep conversion.
   */
  @observable.ref news: NewsItems[] = savedNews() ?? []
  @observable historyItems: CollectionItem[] = []
  @observable loading = true
  @observable newsError = false
  @observable photosLoading = true
  @observable photosError = false
  @observable selectedPostId: string | null = null

  // post detail
  @observable.ref activePost: NewsItems | null = null
  @observable.ref postHistory: NewsItems[] = []
  @observable.ref postComments: IComment[] = []
  @observable.ref postUsers: Users | null = null

  /** A photo from the list or a link, shown in place of the post while it is open. */
  readonly panel = new PhotoPanel({
    openFullScreen: params => this.navigateTo(SCREENS.FULL_SCREEN_IMAGE, params),
  })

  // A getter, not a field: a field is evaluated once when the view model is constructed and
  // would keep the language that was active back then.
  @computed
  get segmentOptions(): SegmentedControlOption[] {
    return [
      { label: t('news.posts'), value: 'posts' },
      { label: t('news.photos'), value: 'photos' },
    ]
  }

  constructor() {
    super()
    makeObservable(this)
    this.loadAll()
  }

  private loadAll() {
    return Promise.allSettled([this.loadNews(), this.loadPhotos()])
  }

  @computed
  get canGoBack() {
    return this.postHistory.length > 0
  }

  @action.bound
  async retry() {
    if (this.selectedTab === 'posts') {
      await this.loadNews()
    } else {
      await this.loadPhotos()
    }
  }

  @action.bound
  setSelectedTab(tab: NewsTab) {
    this.selectedTab = tab
  }

  @action.bound
  async loadNews() {
    try {
      // The spinner only stands in for an empty list: news kept from the last visit stay shown.
      this.loading = this.news.length === 0
      this.newsError = false
      const newsData = await loadNews(true)
      runInAction(() => {
        this.news = newsData
        this.loading = false
      })
    } catch {
      runInAction(() => {
        this.loading = false
        this.newsError = true
      })
    }
  }

  @action.bound
  async loadPhotos() {
    try {
      this.photosLoading = true
      this.photosError = false
      // The photos bring the names of their regions.
      const { photos, rhash } = await ApiService.getRecentPhotos()
      runInAction(() => {
        this.historyItems = photos.map(photo => ({
          title: photo.title,
          description: [photo.year, getRegionPath(photo.rs, rhash)].filter(Boolean).join(', '),
          cid: photo.cid.toString(),
          file: photo.file,
        }))
        this.photosLoading = false
      })
    } catch {
      runInAction(() => {
        this.photosLoading = false
        this.photosError = true
      })
    }
  }

  // -------------------------------- Post detail --------------------------------

  @action.bound
  openPost(post: NewsItems) {
    // The photo is closed, not just hidden, so tapping it again opens it.
    this.panel.close()
    this.selectedPostId = post._id
    this.activePost = post
    this.postHistory = []
    this.postComments = []
    this.postUsers = null
    this.loadPostComments()
  }

  @action.bound
  async loadPostComments() {
    const post = this.activePost
    if (!post) return
    try {
      const { users, comments } = await ApiService.getNewsComments(post.cid)
      // Another post may have been opened while the comments were on their way.
      if (this.activePost !== post) return
      runInAction(() => {
        this.postUsers = users
        this.postComments = comments
      })
    } catch {}
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
      const login = userLoginFromLink(href)
      if (login) {
        this.pushTo(SCREENS.PROFILE, { login })
      } else {
        Linking.openURL(href)
      }
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

  /** The open post, in the same words as the profile shares one. */
  @action.bound
  shareNews() {
    // The header is built in a layout effect, and the post may have changed since.
    if (!this.activePost) return
    Share.share({
      message: `${this.activePost.title}: https://pastvu.com/news/${this.activePost.cid}`,
    })
  }

  // -------------------------------- Photo detail --------------------------------

  @action.bound
  showPhoto(cid: string) {
    this.panel.select(cid)
  }
}

export default NewsVM