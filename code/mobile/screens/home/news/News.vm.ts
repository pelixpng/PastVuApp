import { action, computed, makeObservable, observable } from 'mobx'
import { SCREENS } from '../../../navigation/navigation.types'
import { BaseViewModelProvider } from '../../../provider/vm.provider'
import { SegmentedControlOption } from '../../../../core/components/ui/segmentedControl/SegmentedControl'
import ApiService from '../../../../core/api/apiService'
import { NewsItems, NewsPhoto } from '../../../../core/types/apiNews'
import { CollectionItem } from '../collection/Collection.screen'
import { getRegionPath } from '../../../../core/utils/getRegionPath'

export type NewsTab = 'posts' | 'photos'

class NewsVM extends BaseViewModelProvider<SCREENS.NEWS> {
  @observable selectedTab: NewsTab = 'posts'
  @observable news: NewsItems[] = []
  @observable photos: NewsPhoto[] = []
  @observable historyItems: CollectionItem[] = []
  @observable loading: boolean = true
  @observable newsError = false
  @observable photosError = false
  private regionsMap: Map<number, any> = new Map()

  segmentOptions: SegmentedControlOption[] = [
    { label: 'Посты', value: 'posts' },
    { label: 'Фото', value: 'photos' },
  ]

  constructor() {
    super()
    makeObservable(this)
    this.loadAll()
  }

  private async loadAll() {
    await this.loadRegions()
    await Promise.allSettled([this.loadNews(), this.loadPhotos()])
  }

  // ------------------------------------------ Computed ------------------------------------------
  @computed
  get displayedData(): NewsItems[] | CollectionItem[] {
    return this.selectedTab === 'posts' ? this.news : this.historyItems
  }

  // ------------------------------------------ Actions ------------------------------------------

  @action.bound
  setSelectedTab(tab: NewsTab) {
    this.selectedTab = tab
  }

  @action.bound
  async retry() {
    if (this.regionsMap.size === 0) {
      await this.loadRegions()
    }
    if (this.selectedTab === 'posts') {
      await this.loadNews()
    } else {
      await this.loadPhotos()
    }
  }

  @action.bound
  async loadNews() {
    try {
      this.loading = true
      this.newsError = false
      const newsData = await ApiService.getNews()
      this.news = newsData
    } catch (error) {
      console.log('❌ Error loading news:', error)
      this.newsError = true
    } finally {
      this.loading = false
    }
  }

  @action.bound
  async loadPhotos() {
    try {
      this.photosError = false
      const photosData = await ApiService.getRecentPhotos()
      this.historyItems = photosData.map((photo: NewsPhoto) => ({
        title: photo.title,
        description: `${photo.year}, ${getRegionPath(photo.rs, this.regionsMap)}`,
        cid: photo.cid.toString(),
        file: photo.file,
      }))
    } catch (error) {
      console.log('❌ Error loading photos:', error)
      this.photosError = true
    }
  }

  @action.bound
  async loadRegions() {
    try {
      this.regionsMap = await ApiService.getRegions()
    } catch (error) {
      console.log('❌ Error loading regions:', error)
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
