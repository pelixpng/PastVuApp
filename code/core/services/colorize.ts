import * as FileSystem from 'expo-file-system/legacy'
import Colorizer from '../../modules/colorizer'

/** How long the placeholder takes where there is no colorizer, so the progress state shows. */
const PLACEHOLDER_DELAY_MS = 2500

/**
 * Colourises a black-and-white photo and returns the result as a local file, which is what saving
 * to the gallery takes.
 *
 * The photo is coloured on device by modules/colorizer: DDColor-L on the CPU, through Core ML on
 * iOS 16+ and ONNX Runtime on Android (half precision on the Neural Engine or a GPU breaks this
 * model's colours). Where the native module is missing a placeholder waits as a request would
 * and hands back a copy of the original.
 */
export const colorizePhoto = async (uri: string): Promise<string> => {
  const source = await download(uri)
  if (!Colorizer) {
    await new Promise(resolve => setTimeout(resolve, PLACEHOLDER_DELAY_MS))
    return source
  }
  try {
    return await Colorizer.colorize(source)
  } finally {
    await discardColorized(source)
  }
}

/**
 * Whether colouring makes sense for the photo: true for black-and-white ones. Judged from the
 * small thumbnail (a few kilobytes), as colour shows at any size. Where there is no colorizer
 * (Android for now) every photo counts, so the placeholder stays reachable.
 */
export const isMonochromePhoto = async (thumbnailUri: string): Promise<boolean> => {
  if (!Colorizer) return true
  const source = await download(thumbnailUri)
  try {
    return await Colorizer.isMonochrome(source)
  } finally {
    await discardColorized(source)
  }
}

/** Deletes a result once the screen no longer shows it, so results do not pile up in the cache. */
export const discardColorized = (uri: string) =>
  FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => undefined)

/** The colorizer reads local files, so the photo is fetched into the cache first. */
const download = async (uri: string) => {
  const target = `${FileSystem.cacheDirectory}colorize-source-${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`
  const result = await FileSystem.downloadAsync(uri, target)
  if (result.status !== 200) {
    await discardColorized(result.uri)
    throw new Error(`Download failed with HTTP ${result.status}`)
  }
  return result.uri
}
