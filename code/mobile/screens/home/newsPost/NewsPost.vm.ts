import { action, autorun, computed, makeObservable, observable } from 'mobx'
import { Linking } from 'react-native'
import { SCREENS } from '../../../navigation/navigation.types'
import { BaseViewModelProvider } from '../../../provider/vm.provider'
import { IComment, Users } from '../../../../core/types/apiPhotoComment'
import ApiService from '../../../../core/api/apiService'

class NewsPostVM extends BaseViewModelProvider<SCREENS.NEWS_POST> {
  @observable comments: IComment[] = []
  @observable users: Users | null = null

  constructor() {
    super()
    makeObservable(this)
    autorun(() => {
      if (this.screenParams?.cid) {
        this.getComments()
      }
    })
  }

  // ------------------------------------------ Computed ------------------------------------------

  @computed
  get post() {
    return this.screenParams
  }

  // ------------------------------------------ Actions ------------------------------------------

  @action.bound
  async getComments() {
    // try {. не работает
    //   const { users, comments } = await ApiService.getComments(this.screenParams.cid.toString())
    //   console.log('Loaded comments:', comments)
    //   this.users = users
    //   this.comments = comments
    // } catch (error) {
    //   console.log('Error loading comments:', error)
    // }
  }

  @action.bound
  openPhotoFromLink(href: string) {
    const match = href.match(/\/p\/(\d+)/)
    if (match) {
      const cid = match[1]
      this.navigateTo(SCREENS.PHOTO_DETAIL, { cid, title: `#${cid}` })
    } else {
      Linking.openURL(href)
    }
  }
}

export default NewsPostVM
