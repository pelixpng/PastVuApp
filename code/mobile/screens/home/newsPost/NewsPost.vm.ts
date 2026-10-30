import { action, autorun, computed, makeObservable, observable } from 'mobx'
import { Linking, Share } from 'react-native'
import { SCREENS } from '../../../navigation/navigation.types'
import { BaseViewModelProvider } from '../../../provider/vm.provider'
import { IComment, Users } from '../../../../core/types/apiPhotoComment'
import { NewsItems } from '../../../../core/types/apiNews'
import ApiService from '../../../../core/api/apiService'
import { findNews } from '../../../../core/services/news'
import { userLoginFromLink } from '../../../../core/utils/userLink'

class NewsPostVM extends BaseViewModelProvider<SCREENS.NEWS_POST> {
  // References, not deep observables: server data is replaced, never edited, and deep conversion of
  // a long discussion froze the screen for a tenth of a second or more.
  @observable.ref comments: IComment[] = []
  @observable.ref users: Users | null = null
  @observable.ref activePost: NewsItems | null = null

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

  // ------------------------------------------ Actions ------------------------------------------

  @action.bound
  async loadComments() {
    const post = this.activePost!
    try {
      this.comments = []
      this.users = null
      const { users, comments } = await ApiService.getNewsComments(post.cid)
      // A news link may have opened another post while this request was in flight. Without this
      // the slower, older response would put its comments under the newer post.
      if (this.activePost !== post) return
      this.users = users
      this.comments = comments
    } catch (error) {
      if (__DEV__) console.log('Error loading news comments:', error)
    }
  }

  @action.bound
  async openPhotoFromLink(href: string) {
    const photoMatch = href.match(/\/p\/(\d+)/)
    const newsMatch = href.match(/\/news\/(\d+)/)
    if (photoMatch) {
      const cid = photoMatch[1]
      // Pushed: a photo detail may already be lower in the stack, under this post.
      this.pushTo(SCREENS.PHOTO_DETAIL, { cid, title: `#${cid}` })
    } else if (newsMatch) {
      try {
        const cid = Number(newsMatch[1])
        const post = await findNews(cid)
        if (post) {
          this.activePost = post
          this.loadComments()
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
  openProfile(login: string) {
    this.pushTo(SCREENS.PROFILE, { login })
  }

  @action.bound
  share() {
    Share.share({
      message: `${this.activePost!.title}: https://pastvu.com/news/${this.activePost!.cid}`,
    })
  }
}

export default NewsPostVM
