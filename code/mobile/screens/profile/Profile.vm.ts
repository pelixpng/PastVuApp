import { action, autorun, computed, makeObservable, observable, runInAction } from 'mobx'
import { Linking } from 'react-native'
import { SCREENS } from '../../navigation/navigation.types'
import { BaseViewModelProvider } from '../../provider/vm.provider'
import { t } from '../../../core/i18n'
import { SegmentedControlOption } from '../../../core/components/ui/segmentedControl/SegmentedControl'
import { FilterChip } from '../../../core/components/ui/FilterChips'
import { findNews } from '../../../core/services/news'
import { Users } from '../../../core/types/apiPhotoComment'
import { formatNumber } from '../../../core/utils/formatNumber'
import { userLoginFromLink } from '../../../core/utils/userLink'
import {
  CommentCounts,
  CommentTarget,
  PagedList,
  PagedListState,
  ProfilePhotoRow,
  ProfileRow,
  ProfileState,
  ProfileTab,
  UserCommentItem,
  commentAuthor,
  fetchCommentsPage,
  fetchPhotosPage,
  groupComments,
  loadProfileState,
  shareProfileLink,
} from '../../../core/services/userProfile'

class ProfileVM extends BaseViewModelProvider<SCREENS.PROFILE> {
  @observable.ref profileState: ProfileState = { status: 'loading' }
  @observable profileTab: ProfileTab = 'photos'
  /** Which comments the comments tab shows: under photos or under news. */
  @observable commentTarget: CommentTarget = 'photo'
  @observable.ref commentCounts: CommentCounts | null = null
  private login = ''
  readonly userPhotos = new PagedList<ProfilePhotoRow>(page => fetchPhotosPage(this.login, page))
  readonly photoComments = new PagedList<UserCommentItem>(page =>
    fetchCommentsPage(this.login, page, 'photo', this.setCommentCounts),
  )
  readonly newsComments = new PagedList<UserCommentItem>(page =>
    fetchCommentsPage(this.login, page, 'news', this.setCommentCounts),
  )

  constructor() {
    super()
    makeObservable(this)
    autorun(() => {
      const login = this.screenParams?.login
      if (login && login !== this.login) {
        this.login = login
        this.loadProfile()
      }
    })
  }

  // Getters, not fields, so the labels follow a language switch.
  @computed
  get profileTabs(): SegmentedControlOption[] {
    return [
      { label: t('news.photos'), value: 'photos' },
      { label: t('photo.comments'), value: 'comments' },
    ]
  }

  /** The comment filter, with the totals once the first page has brought them. */
  @computed
  get commentFilters(): FilterChip[] {
    const counts = this.commentCounts
    return [
      {
        value: 'photo',
        label: t('profile.commentsOnPhotos'),
        count: counts ? formatNumber(counts.photo) : undefined,
      },
      {
        value: 'news',
        label: t('profile.commentsOnNews'),
        count: counts ? formatNumber(counts.news) : undefined,
      },
    ]
  }

  @computed
  get commentList(): PagedList<UserCommentItem> {
    return this.commentTarget === 'photo' ? this.photoComments : this.newsComments
  }

  @computed
  get activeList(): PagedListState {
    return this.profileTab === 'photos' ? this.userPhotos : this.commentList
  }

  /** Photos as collection rows; comments grouped under the photo or post they were left on. */
  @computed
  get activeRows(): ProfileRow[] {
    return this.profileTab === 'photos'
      ? this.userPhotos.items
      : groupComments(this.commentList.items, this.login)
  }

  /**
   * The author of every comment in the tab, for their avatar next to each one. Kept alive: the
   * rows read it outside any reaction, where it would be worked out anew on every read, and a new
   * object draws every comment on screen again.
   */
  @computed({ keepAlive: true })
  get commentUsers(): Users | null {
    return this.profileState.status === 'ready' ? commentAuthor(this.profileState.profile) : null
  }

  @action.bound
  setCommentCounts(counts: CommentCounts) {
    // Every page brings them; the same totals again would only redraw the list.
    const current = this.commentCounts
    if (current?.photo === counts.photo && current.news === counts.news) return
    this.commentCounts = counts
  }

  @action.bound
  async loadProfile() {
    this.profileState = { status: 'loading' }
    // The first page needs only the login, so it goes out with the profile rather than after it;
    // the list stays hidden until the profile is in.
    const list = this.profileTab === 'photos' ? this.userPhotos : this.commentList
    if (list.items.length === 0) list.loadMore()
    const state = await loadProfileState(this.login)
    runInAction(() => {
      this.profileState = state
    })
  }

  /** Named apart from `share`, which shares the open photo on the tablet. */
  @action.bound
  shareProfile() {
    const name = this.profileState.status === 'ready' ? this.profileState.profile.disp : undefined
    shareProfileLink(this.login, name)
  }

  @action.bound
  setProfileTab(tab: ProfileTab) {
    this.profileTab = tab
    this.loadFirstPage()
  }

  @action.bound
  setCommentTarget(target: CommentTarget) {
    this.commentTarget = target
    this.loadFirstPage()
  }

  /** Each list loads the first time it is shown. */
  private loadFirstPage() {
    const list = this.profileTab === 'photos' ? this.userPhotos : this.commentList
    if (list.items.length === 0 && !list.failed) list.loadMore()
  }

  /** Pushed: a photo detail may already be lower in the stack, under this profile. */
  @action.bound
  openPhoto(cid: string, title: string) {
    this.pushTo(SCREENS.PHOTO_DETAIL, { cid, title })
  }

  /** The news screen needs the whole post, which only the news feed has. */
  @action.bound
  async openNews(cid: string) {
    try {
      const post = await findNews(Number(cid))
      if (post) {
        this.pushTo(SCREENS.NEWS_POST, post)
        return
      }
    } catch {}
    Linking.openURL(`https://pastvu.com/news/${cid}`)
  }

  /** A row or a comment: opens the photo or the post it belongs to. */
  @action.bound
  openRow(row: ProfileRow) {
    if (row.kind === 'photo') this.openPhoto(row.cid, row.title)
    else if (row.kind === 'news') this.openNews(row.cid)
    else if (row.target === 'photo') this.openPhoto(row.targetCid, row.targetTitle)
    else this.openNews(row.targetCid)
  }

  /** A link inside a comment: photos, profiles and news open in the app, the rest in a browser. */
  @action.bound
  openLink(href: string) {
    const photoMatch = href.match(/\/p\/(\d+)/)
    if (photoMatch) {
      this.openPhoto(photoMatch[1], `#${photoMatch[1]}`)
      return
    }
    const login = userLoginFromLink(href)
    if (login) {
      if (login !== this.login) this.pushTo(SCREENS.PROFILE, { login })
      return
    }
    const newsMatch = href.match(/\/news\/(\d+)/)
    if (newsMatch) {
      this.openNews(newsMatch[1])
      return
    }
    Linking.openURL(href)
  }
}

export default ProfileVM
