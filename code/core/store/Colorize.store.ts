import { action, makeObservable, observable, runInAction } from 'mobx'
import { Alert } from 'react-native'
import {
  colorizePhoto,
  discardColorized,
  isMonochromePhoto,
  watermarkPhoto,
} from '../services/colorize'
import { MMKVStorage } from '../storage/mmkv'
import { t } from '../i18n'
import ColorizerModel from './ColorizerModel.store'

/**
 * Colour versions of photos, by photo cid, shared by every screen with the palette button: the
 * post, its full-screen view and the compare screen. Switching it on in one place shows the colour
 * everywhere the photo appears; switching it off anywhere goes back to the original everywhere.
 *
 * The colour versions carry an "AI" mark, unless it is switched off in settings.
 */
class ColorizeStore {
  /** Local file of each photo's colour version, while it is switched on. */
  readonly results = observable.map<string, string>()
  /**
   * A copy of each colour version with the "AI COLORIZATION" mark, shown and saved while the mark
   * is on. The clean files in `results` are kept for when it is switched off.
   */
  readonly watermarked = observable.map<string, string>()
  /** Photos being coloured right now. */
  readonly running = observable.set<string>()
  /** Whether each checked photo is black and white; the palette button shows only on those. */
  readonly monochrome = observable.map<string, boolean>()
  /** The setting: the "AI" mark on coloured photos. On unless switched off. */
  @observable watermark = MMKVStorage.get('aiWatermark') !== 'no'

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

  /** A background pass marking photos coloured while the mark was off. */
  private markingMissing = false

  isColorized(cid: string | null | undefined) {
    return !!cid && this.results.has(cid)
  }

  isColorizing(cid: string | null | undefined) {
    return !!cid && this.running.has(cid)
  }

  /**
   * What the photo shows and saves: the colour version when it is on, marked while the mark is
   * switched on (clean until its marked copy is ready), the given original otherwise.
   */
  displayUriFor(cid: string | null | undefined, original: string) {
    if (!cid) return original
    const clean = this.results.get(cid)
    if (!clean) return original
    return (this.watermark && this.watermarked.get(cid)) || clean
  }

  /** The settings switch; switched on, it marks the photos already coloured in the background. */
  @action.bound
  setWatermark(on: boolean) {
    this.watermark = on
    MMKVStorage.set('aiWatermark', on ? 'yes' : 'no')
    if (on) this.markMissing()
  }

  /** The palette button: colours the photo from its original, or goes back to the original. */
  @action.bound
  async toggle(cid: string, original: string) {
    if (this.running.has(cid)) return
    const current = this.results.get(cid)
    if (current) {
      const marked = this.watermarked.get(cid)
      this.results.delete(cid)
      this.watermarked.delete(cid)
      discardColorized(current)
      if (marked) discardColorized(marked)
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
      let marked: string | undefined
      // Marked before it is published, so no screen shows an unmarked frame first. A failed mark
      // fails the colouring: the community asked that coloured photos carry it.
      if (this.watermark) {
        marked = await watermarkPhoto(uri).catch(error => {
          discardColorized(uri)
          throw error
        })
      }
      runInAction(() => {
        this.results.set(cid, uri)
        if (marked) this.watermarked.set(cid, marked)
      })
    } catch (error) {
      console.error('colorize failed', error)
      Alert.alert(t('common.error'), t('colorize.error'))
    } finally {
      runInAction(() => this.running.delete(cid))
    }
  }

  /**
   * In the background pass a failed mark is only logged: the photo already shows in colour, and
   * the next pass tries it again.
   */
  private markedCopy(uri: string) {
    return watermarkPhoto(uri).catch(error => {
      console.error('watermark failed', error)
      return undefined
    })
  }

  /**
   * Marks the photos coloured while the mark was off. One at a time: each copy decodes a whole
   * photo, perhaps while another one is being coloured.
   */
  private async markMissing() {
    if (this.markingMissing) return
    this.markingMissing = true
    // Files this pass failed to mark, so it ends.
    const failed = new Set<string>()
    try {
      // Rescanned after each copy: the mark may go off and on meanwhile, with more photos coloured
      // unmarked, and the call that switched it back on returned at once.
      while (this.watermark) {
        const next = [...this.results].find(
          ([cid, uri]) => !this.watermarked.has(cid) && !failed.has(uri),
        )
        if (!next) break
        const [cid, uri] = next
        const marked = await this.markedCopy(uri)
        if (!marked) {
          failed.add(uri)
          continue
        }
        runInAction(() => {
          // Switched off or coloured anew meanwhile: nothing would show this copy.
          if (this.results.get(cid) === uri && !this.watermarked.has(cid)) {
            this.watermarked.set(cid, marked)
          } else {
            discardColorized(marked)
          }
        })
      }
    } finally {
      this.markingMissing = false
    }
  }
}

export default new ColorizeStore()
