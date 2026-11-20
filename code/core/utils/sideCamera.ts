import { Platform } from 'react-native'
import { EdgeInsets } from 'react-native-safe-area-context'

/** A part of the screen, in points from its top-left corner. */
export type ScreenRect = { x: number; y: number; width: number; height: number }

/**
 * iPhone Duo's camera line, measured in the iOS 27.2 simulator. On the cover display the camera is
 * at the top of the vertical bar on the right, 29 pt from the top of the screen and 37 pt across.
 * The system reports it through UIView.reservedRegions, which the simulator leaves empty, so this
 * stands in for it in a window with a vertical bar on the right and no top inset. The inner display
 * has the same line: its camera is under the screen, its status bar is centred on the line, and its
 * top inset in portrait is this plus a 16 pt margin.
 */
const CAMERA_LINE = { top: 29, size: 37 }

/**
 * The camera beside the top of the screen rather than above it, that a row `rowHeight` tall at the
 * top inset would run into: iPhone Duo's cover display has its camera in the top-right corner and
 * a top safe-area inset of 0. Null where the camera sits within the top inset, as on other iPhones.
 *
 * `regions` are what the hardware covers of the screen (see modules/window-region
 * ReservedRegionsView), or none where nothing measures it; `width` is the screen's.
 */
export const cameraBesideTop = (
  regions: ScreenRect[],
  insets: EdgeInsets,
  width: number,
  rowHeight: number,
): ScreenRect | null => {
  const { top, right } = insets
  const cameras: ScreenRect[] =
    regions.length || Platform.OS !== 'ios' || top > 0 || right === 0
      ? regions
      : [{ x: width - right, y: CAMERA_LINE.top, width: right, height: CAMERA_LINE.size }]
  return cameras.find(r => r.y < top + rowHeight && r.y + r.height > top) ?? null
}

/** The top of a row `rowHeight` tall level with `camera`, centred on it, never above `top`. */
export const topLevelWith = (camera: ScreenRect, rowHeight: number, top: number) =>
  Math.max(top, camera.y + camera.height / 2 - rowHeight / 2)

/**
 * How far in from the right the status bar reaches on that line, the clock and the Wi-Fi ring, as
 * measured in the iOS 27.2 simulator: a row's buttons stay left of it.
 */
export const UNFOLDED_STATUS_BAR_WIDTH = 120

/**
 * The top of a row `rowHeight` tall on the camera line of an iPhone unfolded in portrait, whose top
 * inset holds that whole line: the row stands in the inset, away from the status bar on the right.
 * Null elsewhere: an iPad, and an unfolded iPhone in landscape, with the bar at the side.
 */
export const topOnUnfoldedCameraLine = (top: number, rowHeight: number) =>
  Platform.OS === 'ios' && !Platform.isPad && top >= CAMERA_LINE.top + CAMERA_LINE.size
    ? CAMERA_LINE.top + CAMERA_LINE.size / 2 - rowHeight / 2
    : null
