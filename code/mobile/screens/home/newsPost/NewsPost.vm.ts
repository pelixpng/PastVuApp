import { action, autorun, computed, makeObservable, observable } from 'mobx'
import { Linking, Share } from 'react-native'
import { SCREENS } from '../../../navigation/navigation.types'
import { BaseViewModelProvider } from '../../../provider/vm.provider'
import { IComment, Users } from '../../../../core/types/apiPhotoComment'
import { NewsItems } from '../../../../core/types/apiNews'
import ApiService from '../../../../core/api/apiService'

class NewsPostVM extends BaseViewModelProvider<SCREENS.NEWS_POST> {
  @observable comments: IComment[] = []
  @observable users: Users | null = null
  @observable activePost: NewsItems | null = null
  @observable.ref postHistory: NewsItems[] = []

  constructor() {
    super()
    makeObservable(this)
    autorun(() => {
      if (this.screenParams?.cid) {
        this.activePost = this.screenParams
        this.loadComments()
      }
    })
  }

  // ------------------------------------------ Computed ------------------------------------------

  @computed
  get post() {
    return this.activePost
  }

  @computed
  get canGoBack() {
    return this.postHistory.length > 0
  }

  // ------------------------------------------ Actions ------------------------------------------

  @action.bound
  async loadComments() {
    try {
      this.comments = []
      this.users = null
      const { users, comments } = await ApiService.getNewsComments(this.activePost!.cid)
      this.users = users
      this.comments = comments
    } catch (error) {
      console.log('Error loading news comments:', error)
    }
  }

  @action.bound
  async openPhotoFromLink(href: string) {
    const photoMatch = href.match(/\/p\/(\d+)/)
    const newsMatch = href.match(/\/news\/(\d+)/)
    if (photoMatch) {
      const cid = photoMatch[1]
      this.navigateTo(SCREENS.PHOTO_DETAIL, { cid, title: `#${cid}` })
    } else if (newsMatch) {
      try {
        const cid = Number(newsMatch[1])
        const news = await ApiService.getNews()
        const post = news.find((n: { cid: number }) => n.cid === cid)
        if (post) {
          this.postHistory = [...this.postHistory, this.activePost!]
          this.activePost = post
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
    this.loadComments()
    return true
  }

  @action.bound
  share() {
    Share.share({
      message: `${this.activePost!.title}: https://pastvu.com/news/${this.activePost!.cid}`,
    })
  }
}

export default NewsPostVM
