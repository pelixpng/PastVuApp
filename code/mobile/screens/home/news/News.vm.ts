import { action, computed, makeObservable, observable } from 'mobx'
import { SCREENS } from '../../../navigation/navigation.types'
import { BaseViewModelProvider } from '../../../provider/vm.provider'
import { SegmentedControlOption } from '../../../../core/components/ui/segmentedControl/SegmentedControl'
import ApiService from '../../../../core/api/apiService'
import { NewsItems } from '../../../../core/types/apiNews'

export type NewsTab = 'posts' | 'photos'

class NewsVM extends BaseViewModelProvider<SCREENS.NEWS> {
  @observable selectedTab: NewsTab = 'posts'
  @observable news: NewsItems[] = []
  @observable photos: any[] = []
  @observable loading: boolean = true

  segmentOptions: SegmentedControlOption[] = [
    { label: 'Посты', value: 'posts' },
    { label: 'Фото', value: 'photos' },
  ]

  constructor() {
    super()
    makeObservable(this)
    this.loadNews()
    this.loadPhotos()
  }

  // ------------------------------------------ Computed ------------------------------------------
  @computed
  get displayedData(): any[] {
    return this.selectedTab === 'posts' ? this.news : this.photos
  }

  // ------------------------------------------ Actions ------------------------------------------

  @action.bound
  setSelectedTab(tab: NewsTab) {
    this.selectedTab = tab
  }

  @action.bound
  async loadNews() {
    try {
      this.loading = true
      const newsData = await ApiService.getNews()
      this.news = newsData
    } catch (error) {
      console.log('❌ Error loading news:', error)
    } finally {
      this.loading = false
    }
  }

  @action.bound
  async loadPhotos() {
    try {
      const photosData = await ApiService.getRecentPhotos()
      this.photos = photosData
      console.log('✅ Photos loaded:', this.photos.length)
    } catch (error) {
      console.log('❌ Error loading photos:', error)
    }
  }
}

export default NewsVM
