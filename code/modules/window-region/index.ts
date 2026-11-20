import { ComponentType } from 'react'
import { NativeSyntheticEvent, Platform, ViewProps } from 'react-native'
import { requireNativeViewManager, requireOptionalNativeModule } from 'expo-modules-core'

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

/** Android only; a no-op elsewhere. Safe to call from a Reanimated callback via scheduleOnRN. */
export const refreshWindowRegion = () => WindowRegion?.refresh()

export type WindowControlsViewProps = ViewProps & {
  /**
   * How far below the top of the safe area the window controls reach, in points: called once laid
   * out and whenever that changes, with 0 where there are none.
   */
  onControlsChange: (event: NativeSyntheticEvent<{ top: number }>) => void
}

/**
 * iOS only, null elsewhere. Measures the controls iPadOS 26 and later draws over the top-left
 * corner of a window that is not full screen, which the safe area leaves out. Lay it over the whole
 * root view, as it measures against its own frame; it draws nothing.
 */
export const WindowControlsView: ComponentType<WindowControlsViewProps> | null =
  Platform.OS === 'ios' && requireOptionalNativeModule('WindowRegion')
    ? requireNativeViewManager<WindowControlsViewProps>('WindowRegion')
    : null

/** A part of the screen, in points from the top-left corner of the view that measured it. */
export type ScreenRect = { x: number; y: number; width: number; height: number }

export type ReservedRegionsViewProps = ViewProps & {
  /**
   * The parts of the view the hardware covers, the camera and the Dynamic Island, with their
   * margins: called once laid out and whenever they change.
   */
  onOcclusionChange: (event: NativeSyntheticEvent<{ regions: ScreenRect[] }>) => void
}

/**
 * iOS 27.1 and later only, null elsewhere and reporting nothing before 27.1. Measures what the
 * hardware covers of the view's frame; it draws nothing.
 */
export const ReservedRegionsView: ComponentType<ReservedRegionsViewProps> | null =
  Platform.OS === 'ios' && requireOptionalNativeModule('WindowRegion')
    ? requireNativeViewManager<ReservedRegionsViewProps>('WindowRegion', 'ReservedRegionsView')
    : null
