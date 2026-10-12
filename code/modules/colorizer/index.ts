import { Platform } from 'react-native'
import { requireOptionalNativeModule } from 'expo-modules-core'

type ColorizerModule = {
  /**
   * iOS 16+: colourises the photo in a local file (a path or a file:// URI) on device and
   * resolves with the file:// URI of a JPEG in the caches directory. Rejects on iOS 15, or when
   * the model is not downloaded yet or the photo cannot be read.
   */
  colorize(path: string): Promise<string>
  /** Whether the model has been downloaded and installed; false on iOS 15. */
  isModelInstalled(): boolean
  /**
   * Installs the model from its downloaded zip (a path or a file:// URI): checks the SHA-256,
   * unpacks it and compiles it for this device. Deletes the zip either way. Rejects when the zip
   * does not match the hash or cannot be unpacked.
   */
  installModel(zipPath: string, sha256: string): Promise<void>
  /** Deletes the installed model, freeing its 224 MB. */
  removeModel(): Promise<void>
  /**
   * Whether the photo in a local file is black and white, sepia and toned prints included, so the
   * palette button stays off colour photos. Rejects when the photo cannot be read.
   */
  isMonochrome(path: string): Promise<boolean>
}

const Colorizer =
  Platform.OS === 'ios' || Platform.OS === 'android'
    ? requireOptionalNativeModule<ColorizerModule>('Colorizer')
    : null

export default Colorizer
