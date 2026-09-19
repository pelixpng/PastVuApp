import { Platform } from 'react-native'
import { requireOptionalNativeModule } from 'expo-modules-core'

export type BackLens = {
  /** The localized device name expo-camera uses for `selectedLens`. */
  name: string
  /** Zoom factor relative to the wide lens: 0.5, 1, 2, 3, 5... */
  factor: number
  /** Largest `videoZoomFactor` this lens accepts; expo-camera's `zoom` prop is `maxZoom ** zoom`. */
  maxZoom: number
  /** Digital crops that keep native resolution, e.g. 2 on a 48 MP wide; shown as lenses too. */
  cropFactors: number[]
}

type CameraLensesModule = {
  /** iOS only: physical back lenses with their zoom factors, in the order AVFoundation lists them. */
  getBackLenses(): BackLens[]
}

const CameraLenses =
  Platform.OS === 'ios' ? requireOptionalNativeModule<CameraLensesModule>('CameraLenses') : null

export default CameraLenses
