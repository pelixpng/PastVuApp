import { action, computed, makeObservable, observable } from 'mobx'
import { SCREENS } from '../../../navigation/navigation.types'
import { BaseViewModelProvider } from '../../../provider/vm.provider'
import { SegmentedControlOption } from '../../../../core/components/ui/segmentedControl/SegmentedControl'

export type NewsTab = 'posts' | 'photos'

class NewsVM extends BaseViewModelProvider<SCREENS.NEWS> {
  @observable selectedTab: NewsTab = 'posts'

  segmentOptions: SegmentedControlOption[] = [
    { label: 'Посты', value: 'posts' },
    { label: 'Фото', value: 'photos' },
  ]

  constructor() {
    super()
    makeObservable(this)
  }

  // ------------------------------------------ Computed ------------------------------------------
  @computed
  get displayedData(): any[] {
    // Пока данных нет, возвращаем пустой массив
    return []
  }

  // ------------------------------------------ Actions ------------------------------------------

  @action.bound
  setSelectedTab(tab: NewsTab) {
    this.selectedTab = tab
  }
}

export default NewsVM
