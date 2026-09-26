import { Platform } from 'react-native'
import { requireOptionalNativeModule } from 'expo-modules-core'

type WindowRegionModule = {
  /**
   * Makes Android recompute which parts of the window are transparent over a SurfaceView.
   * Call it after an overlay finishes appearing or disappearing above Google Maps: React Native
   * never triggers that recomputation, so the map would otherwise show through the overlay.
   */
  refresh(): void
}

const WindowRegion =
  Platform.OS === 'android' ? requireOptionalNativeModule<WindowRegionModule>('WindowRegion') : null

/** Android only; a no-op elsewhere. Safe to call from a Reanimated callback via runOnJS. */
export const refreshWindowRegion = () => WindowRegion?.refresh()
