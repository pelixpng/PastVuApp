import { action, computed, makeObservable, observable, reaction } from 'mobx'
import ColorizeStore from './Colorize.store'

/**
 * The colour version of the photo in one post panel (the tablet's map, collection, news and
 * profile): whether the palette shows, what the photo shows, and the colour version stacked above
 * the original. A thin view over ColorizeStore, so colour switched on in one panel shows in every
 * other place the photo appears.
 *
 * Create it after the owner's makeObservable, so the getters read observables that are tracked.
 */
export class PostColorize {
  /** The photo whose colour version is shown above its original; see `isComparingOriginal`. */
  @observable comparingCid: string | null = null

  constructor(
    private readonly cid: () => string | null,
    /** The photo as PastVu serves it, which colouring always starts from. */
    private readonly original: () => string,
    file: () => string | undefined,
  ) {
    makeObservable(this)
    // Every photo opened gets its black-and-white check, from the small thumbnail.
    reaction(
      () => [cid(), file()] as const,
      ([photo, name]) => {
        if (photo && name) ColorizeStore.checkMonochrome(photo, `https://img.pastvu.com/h/${name}`)
      },
      { fireImmediately: true },
    )
  }

  @computed
  get canColorize() {
    return ColorizeStore.canColorize(this.cid())
  }

  @computed
  get isColorized() {
    return ColorizeStore.isColorized(this.cid())
  }

  @computed
  get isColorizing() {
    return ColorizeStore.isColorizing(this.cid())
  }

  /**
   * What the photo shows: the colour version while it is switched on, with the "AI" mark while that
   * is on in settings, the original otherwise. Full screen and then-and-now take it too.
   */
  @computed
  get displayLink() {
    return ColorizeStore.displayUriFor(this.cid(), this.original())
  }

  /** The colour version's file as shown, which saving takes instead of downloading from PastVu. */
  @computed
  get localFile() {
    return this.isColorized ? this.displayLink : undefined
  }

  /** Ends by itself when another photo opens or the colour is switched off. */
  @computed
  get isComparingOriginal() {
    return this.comparingCid !== null && this.comparingCid === this.cid() && this.isColorized
  }

  @action.bound
  toggle() {
    const cid = this.cid()
    if (cid) ColorizeStore.toggle(cid, this.original())
  }

  @action.bound
  toggleCompareOriginal() {
    this.comparingCid = this.isComparingOriginal ? null : this.cid()
  }
}
