import { action, computed, makeObservable, observable, runInAction } from 'mobx'
import { SCREENS } from '../../../navigation/navigation.types'
import { BaseViewModelProvider } from '../../../provider/vm.provider'
import { SegmentedControlOption } from '../../../../core/components/ui/segmentedControl/SegmentedControl'
import ApiService from '../../../../core/api/apiService'
import { NewsItems } from '../../../../core/types/apiNews'
import type { CollectionItem } from '../../../../core/services/photoPost'
import { getRegionPath } from '../../../../core/utils/getRegionPath'
import { loadNews, savedNews } from '../../../../core/services/news'
import { t } from '../../../../core/i18n'

export type NewsTab = 'posts' | 'photos'

class NewsVM extends BaseViewModelProvider<SCREENS.NEWS> {
  @observable selectedTab: NewsTab = 'posts'
  /**
   * The feed kept from the last visit shows at once; the fresh one replaces it. A reference: the
   * feed is replaced whole, never edited, so its 154 posts need no deep conversion.
   */
  @observable.ref news: NewsItems[] = savedNews() ?? []
  @observable historyItems: CollectionItem[] = []
  @observable loading: boolean = true
  @observable newsError = false
  @observable photosLoading = true
  @observable photosError = false

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

  // ------------------------------------------ Actions ------------------------------------------

  @action.bound
  setSelectedTab(tab: NewsTab) {
    this.selectedTab = tab
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
  async loadNews() {
    // The spinner only stands in for an empty list: news kept from the last visit stay shown.
    this.loading = this.news.length === 0
    this.newsError = false
    try {
      const newsData = await loadNews(true)
      runInAction(() => {
        this.news = newsData
      })
    } catch (error) {
      if (__DEV__) console.log('❌ Error loading news:', error)
      runInAction(() => {
        this.newsError = true
      })
    } finally {
      runInAction(() => {
        this.loading = false
      })
    }
  }

  @action.bound
  async loadPhotos() {
    this.photosLoading = true
    this.photosError = false
    try {
      // The photos bring the names of their regions.
      const { photos, rhash } = await ApiService.getRecentPhotos()
      runInAction(() => {
        this.historyItems = photos.map(photo => ({
          title: photo.title,
          description: [photo.year, getRegionPath(photo.rs, rhash)].filter(Boolean).join(', '),
          cid: photo.cid.toString(),
          file: photo.file,
        }))
      })
    } catch (error) {
      if (__DEV__) console.log('❌ Error loading photos:', error)
      runInAction(() => {
        this.photosError = true
      })
    } finally {
      runInAction(() => {
        this.photosLoading = false
      })
    }
  }

  @action.bound
  openPhoto(cid: string, title: string) {
    this.navigateTo(SCREENS.PHOTO_DETAIL, { cid: cid, title: title })
  }

  @action.bound
  openPost(post: NewsItems) {
    this.navigateTo(SCREENS.NEWS_POST, post)
  }
}

export default NewsVM
