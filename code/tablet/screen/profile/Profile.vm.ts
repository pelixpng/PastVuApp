import { action, autorun, computed, makeObservable, observable, runInAction } from 'mobx'
import { Alert, Linking, Share } from 'react-native'
import CollectionVM from '../collection/Collection.vm'
import { SCREENS } from '../../navigation/navigation.types'
import ApiService from '../../../core/api/apiService'
import { t } from '../../../core/i18n'
import { SegmentedControlOption } from '../../../core/components/ui/segmentedControl/SegmentedControl'
import { FilterChip } from '../../../core/components/ui/FilterChips'
import { NewsItems } from '../../../core/types/apiNews'
import { findNews } from '../../../core/services/news'
import { IComment, Users } from '../../../core/types/apiPhotoComment'
import { formatNumber } from '../../../core/utils/formatNumber'
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

/**
 * The photo panel of a profile works exactly like the collection's: loading, history,
 * favourites, saving, sharing, links in comments and the then-and-now view, all inherited. On top
 * of it: the profile, the user's photos and comments for the list on the left, and news posts,
 * which the right panel shows in place of a photo when a comment under news is opened.
 */
class ProfileVM extends CollectionVM<SCREENS.PROFILE> {
  @observable.ref profileState: ProfileState = { status: 'loading' }
  @observable profileTab: ProfileTab = 'photos'
  /** Which comments the comments tab shows: under photos or under news. */
  @observable commentTarget: CommentTarget = 'photo'
  @observable.ref commentCounts: CommentCounts | null = null
  @observable.ref selectedNews: NewsItems | null = null
  @observable selectedNewsCid: string | null = null
  @observable.ref newsPostComments: IComment[] = []
  @observable.ref newsPostUsers: Users | null = null
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
    // The inherited lists start from the saved history and favourites, as in the collection.
    this.getPhotos()
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

  /** The right panel shows a news post only while no photo is open there. */
  @computed
  get showsNews(): boolean {
    return this.selectedNews !== null && this.panel.cid === null
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

  /** Named apart from the panel's `share`, which shares the open photo. */
  @action.bound
  shareProfile() {
    const name = this.profileState.status === 'ready' ? this.profileState.profile.disp : undefined
    shareProfileLink(this.login, name)
  }

  @action.bound
  shareNews() {
    if (!this.selectedNews) return
    Share.share({
      message: `${this.selectedNews.title}: https://pastvu.com/news/${this.selectedNews.cid}`,
    })
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

  /** A photo in the right panel; a news post shown there steps aside. */
  @action.bound
  openPhoto(cid: string) {
    this.selectedNews = null
    this.selectedNewsCid = null
    this.showPhoto(cid)
  }

  /** A news post in the right panel, in place of the photo, with its comments. */
  @action.bound
  async showNews(cid: string) {
    // The photo steps aside completely, so the next one opened starts from a clean panel.
    this.panel.close()
    this.selectedNewsCid = cid
    try {
      const post = await findNews(Number(cid))
      if (!post) {
        Linking.openURL(`https://pastvu.com/news/${cid}`)
        return
      }
      runInAction(() => {
        this.selectedNews = post
        this.newsPostComments = []
        this.newsPostUsers = null
      })
      const { comments, users } = await ApiService.getNewsComments(post.cid)
      // Another post or a photo may have been opened while the comments were on their way.
      if (this.selectedNews !== post) return
      runInAction(() => {
        this.newsPostComments = comments
        this.newsPostUsers = users
      })
    } catch {
      Alert.alert(t('common.error'), t('news.postsError'))
    }
  }

  /** A row or a comment: opens the photo or the post it belongs to. */
  @action.bound
  openRow(row: ProfileRow) {
    if (row.kind === 'photo') this.openPhoto(row.cid)
    else if (row.kind === 'news') this.showNews(row.cid)
    else if (row.target === 'photo') this.openPhoto(row.targetCid)
    else this.showNews(row.targetCid)
  }

  /** A link in a comment or a post: photos open in the panel, the rest as in the collection. */
  @action.bound
  openPanelLink(href: string) {
    const photoMatch = href.match(/\/p\/(\d+)/)
    if (photoMatch) {
      this.openPhoto(photoMatch[1])
      return
    }
    const newsMatch = href.match(/\/news\/(\d+)/)
    if (newsMatch) {
      this.showNews(newsMatch[1])
      return
    }
    this.openPhotoFromLink(href)
  }
}

export default ProfileVM
