import { action, makeObservable, observable, runInAction } from 'mobx'
import { Alert } from 'react-native'
import { colorizePhoto, discardColorized, isMonochromePhoto } from '../services/colorize'
import { t } from '../i18n'
import ColorizerModel from './ColorizerModel.store'

/**
 * Colour versions of photos, by photo cid, shared by every screen with the palette button: the
 * post, its full-screen view and the compare screen. Switching it on in one place shows the colour
 * everywhere the photo appears; switching it off anywhere goes back to the original everywhere.
 */
class ColorizeStore {
  /** Local file of each photo's colour version, while it is switched on. */
  readonly results = observable.map<string, string>()
  /** Photos being coloured right now. */
  readonly running = observable.set<string>()
  /** Whether each checked photo is black and white; the palette button shows only on those. */
  readonly monochrome = observable.map<string, boolean>()

  constructor() {
    makeObservable(this)
  }

  /**
   * Whether the palette button belongs on this photo: a black-and-white one, or one coloured
   * already (so the colour can always be switched off). Hidden until the check is done, so the
   * button does not show on a colour photo and then vanish.
   */
  canColorize(cid: string | null | undefined) {
    return !!cid && (this.monochrome.get(cid) === true || this.results.has(cid))
  }

  /** Looks at the photo's thumbnail once per photo; a failed check shows the button anyway. */
  async checkMonochrome(cid: string, thumbnail: string) {
    if (this.monochrome.has(cid) || this.checking.has(cid)) return
    this.checking.add(cid)
    const monochrome = await isMonochromePhoto(thumbnail).catch(() => true)
    this.checking.delete(cid)
    runInAction(() => this.monochrome.set(cid, monochrome))
  }

  /** Photos being checked right now, so one opened twice in a row is not downloaded twice. */
  private readonly checking = new Set<string>()

  isColorized(cid: string | null | undefined) {
    return !!cid && this.results.has(cid)
  }

  isColorizing(cid: string | null | undefined) {
    return !!cid && this.running.has(cid)
  }

  /** The colour version when it is on, the given original otherwise. */
  uriFor(cid: string | null | undefined, original: string) {
    return (cid && this.results.get(cid)) || original
  }

  /** The palette button: colours the photo from its original, or goes back to the original. */
  @action.bound
  async toggle(cid: string, original: string) {
    if (this.running.has(cid)) return
    const current = this.results.get(cid)
    if (current) {
      this.results.delete(cid)
      discardColorized(current)
      return
    }
    // The first colouring needs the model, which is downloaded once from the sheet.
    if (!ColorizerModel.isReady) {
      ColorizerModel.showSheet()
      return
    }
    this.running.add(cid)
    try {
      const uri = await colorizePhoto(original)
      runInAction(() => this.results.set(cid, uri))
    } catch (error) {
      console.error('colorize failed', error)
      Alert.alert(t('common.error'), t('colorize.error'))
    } finally {
      runInAction(() => this.running.delete(cid))
    }
  }
}

export default new ColorizeStore()
