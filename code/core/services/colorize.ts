import * as FileSystem from 'expo-file-system/legacy'
import Colorizer from '../../modules/colorizer'

/**
 * Colourises a black-and-white photo and returns the result as a local file, which is what saving
 * to the gallery takes.
 *
 * The photo is coloured on device by modules/colorizer: DDColor-L on the CPU, through Core ML on
 * iOS and ONNX Runtime on Android (half precision on the Neural Engine or a GPU breaks this
 * model's colours).
 */
export const colorizePhoto = async (uri: string): Promise<string> => {
  // Only without a native build (Expo Go, web), where the palette button never shows.
  if (!Colorizer) throw new Error('Colorizer native module is not available')
  const source = await download(uri)
  try {
    return await Colorizer.colorize(source)
  } finally {
    await discardColorized(source)
  }
}

/**
 * A copy of a coloured photo (a local file) with the "AI" mark burnt into its corner, as a new
 * local file; the clean one is left as it is.
 */
export const watermarkPhoto = async (uri: string): Promise<string> => {
  if (!Colorizer) throw new Error('Colorizer native module is not available')
  return Colorizer.addWatermark(uri)
}

/**
 * Whether colouring makes sense for the photo: true for black-and-white ones. Judged from the
 * small thumbnail (a few kilobytes), as colour shows at any size. Without the native colorizer
 * (Expo Go, web) nothing can be coloured, so no photo counts.
 */
export const isMonochromePhoto = async (thumbnailUri: string): Promise<boolean> => {
  if (!Colorizer) return false
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
