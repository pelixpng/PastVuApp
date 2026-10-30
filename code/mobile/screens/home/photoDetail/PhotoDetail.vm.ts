import { action, autorun, computed, makeObservable, observable, runInAction } from 'mobx'
import { SCREENS } from '../../../navigation/navigation.types'
import { Alert, Linking } from 'react-native'
import { BaseViewModelProvider } from '../../../provider/vm.provider'
import { IComment, Users } from '../../../../core/types/apiPhotoComment'
import { findNews } from '../../../../core/services/news'
import { userLoginFromLink } from '../../../../core/utils/userLink'
import { saveLocalImage, savePhoto, sharePhoto } from '../../../../core/utils/getPhoto'
import ApiStore from '../../../../core/store/Api.store'
import { PostColorize } from '../../../../core/store/PostColorize'
import * as PhotoPost from '../../../../core/services/photoPost'
import { t } from '../../../../core/i18n'
import * as StreetView from '../../../../core/services/streetView'
import { CompareMode } from '../../../../core/components/compare/CompareView'

class PhotoDetailVM extends BaseViewModelProvider<SCREENS.PHOTO_DETAIL> {
  // References, not deep observables: server data is replaced, never edited, and deep conversion of
  // a long discussion froze the screen for a tenth of a second or more.
  @observable.ref comments: IComment[] = []
  @observable.ref users: Users | null = null
  @observable.ref postInfo: Photo | null = null
  @observable isFavorite = false
  @observable activeCid: string | null = null
  @observable.ref streetView: StreetView.StreetViewInfo | null = null
  @observable.ref cidHistory: string[] = []

  /** The open photo's colour version: palette, colour photo, comparison with the original. */
  readonly colorize: PostColorize

  /**
   * The preview's size once it has loaded, which full screen takes instead of measuring the photo
   * again. From the loaded file, not the post data: a /h/ thumbnail is cut to its own proportions.
   */
  private loadedResolution: { uri: string; resolution: PhotoPost.Resolution } | null = null

  constructor() {
    super()
    makeObservable(this)
    // After makeObservable, so it tracks the photo.
    this.colorize = new PostColorize(
      () => this.activeCid,
      () => this.imageLink,
      () => this.postInfo?.file,
    )
    autorun(() => {
      if (this.screenParams?.cid) {
        this.activeCid = this.screenParams.cid
        this.getPhotoInfo()
      }
    })
  }

  // ------------------------------------------ Computed ------------------------------------------

  @computed
  get imageLink() {
    return `https://img.pastvu.com/${ApiStore.photoQualitySettings}/${this.postInfo?.file}`
  }

  @computed
  get imageResolution() {
    return this.postInfo ? PhotoPost.photoResolution(this.postInfo) : undefined
  }

  /**
   * The preview's size for full screen, only when it opens that same file. The colour version may
   * have been made at another photo quality, and a late load from the previous photo carries its
   * own link; a local colour file is cheap to measure.
   */
  private resolutionFor(uri: string) {
    return this.loadedResolution?.uri === uri ? this.loadedResolution.resolution : undefined
  }

  @computed
  get streetViewTarget() {
    return StreetView.streetViewTarget(this.postInfo)
  }

  /** Google confirmed a panorama, or could not be asked: either way the header offers it. */
  @computed
  get hasStreetView() {
    return this.streetView !== null && this.streetView.available !== false
  }

  @computed
  get canGoBack() {
    return this.cidHistory.length > 0
  }

  // ------------------------------------------ Actions ------------------------------------------

  @action.bound
  async getPhotoInfo() {
    const cid = this.activeCid!
    try {
      const { photo, users, comments, streetView } = await PhotoPost.loadPost(cid)
      // Another photo may have been opened while this request was in flight (comments link into
      // other posts). Without this the slower, older response would overwrite the newer one.
      if (this.activeCid !== cid) return
      runInAction(() => {
        this.postInfo = photo
        this.users = users
        this.comments = comments
        this.isFavorite = PhotoPost.isFavorite(cid)
      })
      PhotoPost.recordHistory(photo, cid)
      this.checkStreetView(cid, streetView)
    } catch {
      Alert.alert(t('common.error'), t('photo.infoError'))
    }
  }

  /**
   * Runs once the post is shown: the button appears when Google confirms a panorama. The question
   * went out with the post, as soon as the photo brought its place.
   */
  @action.bound
  async checkStreetView(cid: string, check: Promise<StreetView.StreetViewInfo | null>) {
    const info = await check
    if (!info || this.activeCid !== cid) return
    runInAction(() => {
      this.streetView = info
    })
  }

  /**
   * Then-and-now screen. Always opens on Street View, even where Google has no panorama (the
   * screen says so): jumping straight into a live camera would be a surprise.
   */
  @action.bound
  openCompare() {
    // The header keeps the previous photo's buttons while the next one loads.
    if (!this.postInfo) return
    const photo = this.postInfo
    const mode: CompareMode = 'streetView'
    this.navigateTo(SCREENS.COMPARE, {
      mode,
      cid: this.activeCid!,
      photo: { uri: this.imageLink, year: photo.y, ...this.imageResolution },
      target:
        this.hasStreetView && this.streetViewTarget
          ? { ...this.streetViewTarget, panoId: this.streetView?.panoId }
          : null,
      year: this.streetView?.year,
    })
  }

  /** The palette button: colours the photo on device, or goes back to the original. */
  @action.bound
  toggleColorize() {
    // The header keeps the previous photo's buttons while the next one loads.
    if (this.postInfo) this.colorize.toggle()
  }

  @action.bound
  openFullScreenImage() {
    if (!this.postInfo) return
    const uri = this.colorize.displayLink
    this.navigateTo(SCREENS.FULL_SCREEN_IMAGE, {
      title: this.postInfo!.title,
      cid: this.activeCid!,
      uri,
      file: this.postInfo!.file,
      localFile: this.colorize.localFile,
      resolution: this.resolutionFor(uri),
    })
  }

  /** The black-and-white photo under the colour one while they are compared. */
  @action.bound
  openOriginalFullScreen() {
    this.navigateTo(SCREENS.FULL_SCREEN_IMAGE, {
      title: this.postInfo!.title,
      cid: this.activeCid!,
      uri: this.imageLink,
      file: this.postInfo!.file,
      resolution: this.resolutionFor(this.imageLink),
    })
  }

  @action.bound
  share() {
    if (!this.postInfo) return
    sharePhoto(this.postInfo!.title, this.activeCid!)
  }

  @action.bound
  saveImage() {
    if (!this.postInfo) return
    // The colour version when it is on: saving gives what the screen shows.
    if (this.colorize.isColorized) saveLocalImage(this.colorize.displayLink)
    else savePhoto(this.postInfo!.title, this.postInfo!.file)
  }

  @action.bound
  onImageResolution(resolution: PhotoPost.Resolution, uri: string) {
    this.loadedResolution = { uri, resolution }
  }

  @action.bound
  toggleFavorite() {
    if (!this.postInfo) return
    this.isFavorite = PhotoPost.toggleFavorite(this.postInfo, this.activeCid!)
  }

  /**
   * Another photo in place of this one, from a link or the nearby photos; back returns here (see
   * `goBackToPhoto`).
   */
  @action.bound
  openPhoto(cid: string) {
    this.cidHistory = [...this.cidHistory, this.activeCid!]
    this.activeCid = cid
    // Also what scrolls the new post to its top: the screen shows its loading state until the post
    // arrives, so the list mounts afresh.
    this.postInfo = null
    this.streetView = null
    this.users = null
    this.comments = []
    this.getPhotoInfo()
  }

  @action.bound
  async openPhotoFromLink(href: string) {
    const photoMatch = href.match(/\/p\/(\d+)/)
    const newsMatch = href.match(/\/news\/(\d+)/)
    if (photoMatch) {
      this.openPhoto(photoMatch[1])
    } else if (newsMatch) {
      try {
        const cid = Number(newsMatch[1])
        const post = await findNews(cid)
        if (post) {
          // Pushed: a news post may already be lower in the stack, under this photo.
          this.pushTo(SCREENS.NEWS_POST, post)
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
  goBackToPhoto() {
    if (this.cidHistory.length === 0) return false
    const previousCid = this.cidHistory[this.cidHistory.length - 1]
    this.cidHistory = this.cidHistory.slice(0, -1)
    this.activeCid = previousCid
    this.postInfo = null
    this.streetView = null
    this.users = null
    this.comments = []
    this.getPhotoInfo()
    return true
  }
}

export default PhotoDetailVM
