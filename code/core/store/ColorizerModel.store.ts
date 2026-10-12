import { action, computed, makeObservable, observable, runInAction } from 'mobx'
import { Platform } from 'react-native'
import * as FileSystem from 'expo-file-system/legacy'
import Colorizer from '../../modules/colorizer'

/**
 * The colorization model, DDColor-L: too big to ship in the app, so it is downloaded on the first
 * press of the palette, from the app's own Hugging Face repo. Each platform has its own file: a
 * zipped Core ML package on iOS (compiled on device), an ONNX file on Android (taken as it is).
 * Both links are pinned to a commit, so the file behind it can never change under the hash.
 */
export const MODEL_DOWNLOAD = Platform.select({
  android: {
    url: 'https://huggingface.co/pelixpng/pastvu-colorizer/resolve/22513992326decc00f320765f7638e7e2e147036/colorizer-android.onnx',
    sha256: '099db9c1c11008e9e8737a31a3f0ab641ffb9345baeb772be0e690090295254d',
    bytes: 241_468_135,
  },
  default: {
    url: 'https://huggingface.co/pelixpng/pastvu-colorizer/resolve/08790892f419c2386c5d309517da149e63936d45/Colorizer.mlpackage.zip',
    sha256: '921b6e9ee6ec3e19a7458bf3b6aaad70c659da07377c7f43973de3a253241b42',
    bytes: 208_751_447,
  },
})

/** The model on the device, as settings report it: compiled on iOS, the file itself on Android. */
export const INSTALLED_BYTES = Platform.OS === 'android' ? MODEL_DOWNLOAD.bytes : 235_000_000

/**
 * iOS: the zip, its unpacked package and the compiled model briefly exist side by side.
 * Android: the download and its copy, when the cache and the model's folder are on two volumes.
 */
const SPACE_NEEDED =
  Platform.OS === 'android' ? 2 * MODEL_DOWNLOAD.bytes : MODEL_DOWNLOAD.bytes + 2 * 235_000_000

export type ModelPhase = 'missing' | 'downloading' | 'installing' | 'ready' | 'failed'
export type ModelFailure = 'network' | 'space' | 'install'

const ZIP_PATH = `${FileSystem.cacheDirectory}colorizer-model.download`

class ColorizerModelStore {
  @observable phase: ModelPhase = 'missing'
  @observable failure: ModelFailure | null = null
  /** 0...1 of the download. */
  @observable progress = 0
  /** The download sheet; it can close while the download carries on. */
  @observable sheetVisible = false

  private download: FileSystem.DownloadResumable | null = null
  /** Bumped by cancel(), so a run that was stopped leaves the state alone when it unwinds. */
  private run = 0

  constructor() {
    makeObservable(this)
    // Where there is no native colorizer the placeholder needs no model.
    this.phase = !Colorizer || Colorizer.isModelInstalled() ? 'ready' : 'missing'
  }

  @computed
  get isReady() {
    return this.phase === 'ready'
  }

  /** A downloaded model on this device, which settings offer to delete. */
  @computed
  get isInstalled() {
    return !!Colorizer && this.phase === 'ready'
  }

  /** Frees the space; the next palette press offers the download again. */
  @action.bound
  async remove() {
    if (!Colorizer || this.phase !== 'ready') return
    try {
      await Colorizer.removeModel()
    } catch (error) {
      console.error('colorizer model removal failed', error)
    }
    // Whatever is left over, the app treats the model as gone from now on, as the native side does
    // after a failed removal: it only counts a complete model.
    runInAction(() => {
      this.phase = Colorizer!.isModelInstalled() ? 'ready' : 'missing'
    })
  }

  @action.bound
  showSheet() {
    this.sheetVisible = true
  }

  @action.bound
  hideSheet() {
    this.sheetVisible = false
    // A finished or failed state has been seen; the next time the sheet opens fresh.
    if (this.phase === 'failed') {
      this.phase = 'missing'
      this.failure = null
    }
  }

  @action.bound
  async start() {
    if (this.phase === 'downloading' || this.phase === 'installing' || this.phase === 'ready') return
    const run = ++this.run
    this.phase = 'downloading'
    this.failure = null
    this.progress = 0
    try {
      const free = await FileSystem.getFreeDiskStorageAsync()
      if (run !== this.run) return
      if (free < SPACE_NEEDED) {
        this.fail('space')
        return
      }
      await FileSystem.deleteAsync(ZIP_PATH, { idempotent: true })
      // A background session: the download goes on while the app is in the background.
      const download = FileSystem.createDownloadResumable(
        MODEL_DOWNLOAD.url,
        ZIP_PATH,
        {},
        ({ totalBytesWritten, totalBytesExpectedToWrite }) => {
          const total = totalBytesExpectedToWrite > 0 ? totalBytesExpectedToWrite : MODEL_DOWNLOAD.bytes
          runInAction(() => {
            this.progress = Math.min(1, totalBytesWritten / total)
          })
        },
      )
      this.download = download
      const result = await download.downloadAsync()
      // Cancelled: cancel() has already reset the state.
      if (run !== this.run) return
      this.download = null
      if (!result || result.status !== 200) {
        await FileSystem.deleteAsync(ZIP_PATH, { idempotent: true })
        this.fail('network')
        return
      }
      runInAction(() => {
        this.phase = 'installing'
        this.progress = 1
      })
      try {
        await Colorizer!.installModel(result.uri, MODEL_DOWNLOAD.sha256)
      } catch (error) {
        console.error('colorizer model install failed', error)
        this.fail('install')
        return
      }
      runInAction(() => {
        this.phase = 'ready'
      })
    } catch (error) {
      if (run !== this.run) return // cancelled meanwhile
      console.error('colorizer model download failed', error)
      this.download = null
      await FileSystem.deleteAsync(ZIP_PATH, { idempotent: true })
      this.fail('network')
    }
  }

  @action.bound
  async cancel() {
    const download = this.download
    this.download = null
    this.run++
    this.phase = 'missing'
    this.progress = 0
    if (download) await download.cancelAsync().catch(() => undefined)
    await FileSystem.deleteAsync(ZIP_PATH, { idempotent: true })
  }

  @action
  private fail(failure: ModelFailure) {
    this.phase = 'failed'
    this.failure = failure
  }
}

export default new ColorizerModelStore()
