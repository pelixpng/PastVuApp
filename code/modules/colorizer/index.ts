import { Platform } from 'react-native'
import { requireOptionalNativeModule } from 'expo-modules-core'

/** DDColor on device: Core ML on iOS, ONNX Runtime on Android. */
type ColorizerModule = {
  /**
   * Colourises the photo in a local file (a path or a file:// URI) on device and resolves with
   * the file:// URI of a JPEG in the caches directory. Rejects when the model is not downloaded
   * yet or the photo cannot be read.
   */
  colorize(path: string): Promise<string>
  /** Whether the model has been downloaded and installed. */
  isModelInstalled(): boolean
  /**
   * Installs the model from its download (a path or a file:// URI) after checking the SHA-256:
   * on iOS a zipped Colorizer.mlpackage, unpacked and compiled for this device; on Android the
   * .onnx file, moved into place. Deletes the download either way. Rejects when it does not match
   * the hash or cannot be installed.
   */
  installModel(downloadPath: string, sha256: string): Promise<void>
  /** Deletes the installed model, freeing a few hundred MB. */
  removeModel(): Promise<void>
  /**
   * Whether the photo in a local file is black and white, sepia and toned prints included, so the
   * palette button stays off colour photos. Rejects when the photo cannot be read.
   */
  isMonochrome(path: string): Promise<boolean>
  /**
   * Copies a coloured photo (a path or a file:// URI) with an "AI COLORIZATION" mark burnt into
   * its bottom right corner, above PastVu's caption bar, and resolves with the copy's file:// URI
   * in the caches directory. The source file is left as it is.
   */
  addWatermark(path: string): Promise<string>
}

const Colorizer =
  Platform.OS === 'ios' || Platform.OS === 'android'
    ? requireOptionalNativeModule<ColorizerModule>('Colorizer')
    : null

export default Colorizer
