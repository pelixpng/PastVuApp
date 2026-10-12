import { action, autorun, computed, makeObservable, observable, runInAction } from 'mobx'
import { SCREENS } from '../../../navigation/navigation.types'
import { Alert, Linking } from 'react-native'
import { BaseViewModelProvider } from '../../../provider/vm.provider'
import { IComment, Users } from '../../../../core/types/apiPhotoComment'
import ApiService from '../../../../core/api/apiService'
import { userLoginFromLink } from '../../../../core/utils/userLink'
import { saveLocalImage, savePhoto, sharePhoto } from '../../../../core/utils/getPhoto'
import ColorizeStore from '../../../../core/store/Colorize.store'
import ApiStore from '../../../../core/store/Api.store'
import * as PhotoPost from '../../../../core/services/photoPost'
import { t } from '../../../../core/i18n'
import * as StreetView from '../../../../core/services/streetView'
import { CompareMode } from '../../../../core/components/compare/CompareView'

class PhotoDetailVM extends BaseViewModelProvider<SCREENS.PHOTO_DETAIL> {
  @observable comments: IComment[] = []
  @observable users: Users | null = null
  @observable postInfo: Photo | null = null
  @observable isImageLoaded = false
  @observable isFavorite = false
  @observable activeCid: string | null = null
  @observable.ref streetView: StreetView.StreetViewInfo | null = null
  @observable.ref cidHistory: string[] = []
  /** The photo whose colour version is shown above its original; see `isComparingOriginal`. */
  @observable comparingCid: string | null = null

  constructor() {
    super()
    makeObservable(this)
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
  get isColorized() {
    return ColorizeStore.isColorized(this.activeCid)
  }

  @computed
  get canColorize() {
    return ColorizeStore.canColorize(this.activeCid)
  }

  @computed
  get isColorizing() {
    return ColorizeStore.isColorizing(this.activeCid)
  }

  /**
   * What every view of the photo shows: the post, full screen and the compare screen. The colour
   * version while it is switched on, the original otherwise.
   */
  @computed
  get displayLink() {
    return ColorizeStore.uriFor(this.activeCid, this.imageLink)
  }

  /**
   * The colour version stacked above the black-and-white original. Tied to the photo, so it ends by
   * itself when another post opens or the colour is switched off.
   */
  @computed
  get isComparingOriginal() {
    return this.comparingCid !== null && this.comparingCid === this.activeCid && this.isColorized
  }

  @computed
  get imageResolution() {
    return this.postInfo ? PhotoPost.photoResolution(this.postInfo) : undefined
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
      const { photo, users, comments } = await PhotoPost.loadPost(cid)
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
      ColorizeStore.checkMonochrome(cid, `https://img.pastvu.com/h/${photo.file}`)
      this.checkStreetView(cid)
    } catch {
      Alert.alert(t('common.error'), t('photo.infoError'))
    }
  }

  /** Runs after the post is shown: the button appears once Google confirms a panorama. */
  @action.bound
  async checkStreetView(cid: string) {
    const target = this.streetViewTarget
    if (!target) return
    const info = await StreetView.checkAvailability(target)
    if (this.activeCid !== cid) return
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
    const photo = this.postInfo!
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
    if (this.activeCid && this.postInfo) ColorizeStore.toggle(this.activeCid, this.imageLink)
  }

  /** The button next to the palette: the colour version above the original, or back to one photo. */
  @action.bound
  toggleCompareOriginal() {
    this.comparingCid = this.isComparingOriginal ? null : this.activeCid
  }

  @action.bound
  openFullScreenImage() {
    this.navigateTo(SCREENS.FULL_SCREEN_IMAGE, {
      title: this.postInfo!.title,
      cid: this.activeCid!,
      uri: this.displayLink,
      file: this.postInfo!.file,
      localFile: this.isColorized ? this.displayLink : undefined,
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
    })
  }

  @action.bound
  share() {
    sharePhoto(this.postInfo!.title, this.activeCid!)
  }

  @action.bound
  saveImage() {
    // The colour version when it is on: saving gives what the screen shows.
    if (this.isColorized) saveLocalImage(this.displayLink)
    else savePhoto(this.postInfo!.title, this.postInfo!.file)
  }

  @action.bound
  onImageLoad() {
    this.isImageLoaded = true
  }

  @action.bound
  toggleFavorite() {
    this.isFavorite = PhotoPost.toggleFavorite(this.postInfo!, this.activeCid!)
  }

  @action.bound
  async openPhotoFromLink(href: string) {
    const photoMatch = href.match(/\/p\/(\d+)/)
    const newsMatch = href.match(/\/news\/(\d+)/)
    if (photoMatch) {
      this.cidHistory = [...this.cidHistory, this.activeCid!]
      this.activeCid = photoMatch[1]
      this.isImageLoaded = false
      this.postInfo = null
      this.streetView = null
      this.users = null
      this.comments = []
      this.getPhotoInfo()
    } else if (newsMatch) {
      try {
        const cid = Number(newsMatch[1])
        const news = await ApiService.getNews()
        const post = news.find((n: { cid: number }) => n.cid === cid)
        if (post) {
          this.navigateTo(SCREENS.NEWS_POST, post)
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
    this.isImageLoaded = false
    this.postInfo = null
    this.streetView = null
    this.users = null
    this.comments = []
    this.getPhotoInfo()
    return true
  }
}

export default PhotoDetailVM
