import { Platform } from 'react-native'
import { requireOptionalNativeModule } from 'expo-modules-core'

type ScreenCaptureModule = {
  /**
   * Saves what is currently on screen inside the view's bounds to a JPEG in the cache directory
   * and resolves with its `file://` URI. Android only: reads the composed frame back through
   * `PixelCopy`, which is the only way to include a hardware-accelerated WebView.
   */
  captureView(viewTag: number): Promise<string>
}

const ScreenCapture =
  Platform.OS === 'android' ? requireOptionalNativeModule<ScreenCaptureModule>('ScreenCapture') : null

export default ScreenCapture
