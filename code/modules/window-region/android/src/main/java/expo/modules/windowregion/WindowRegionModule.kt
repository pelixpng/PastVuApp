package expo.modules.windowregion

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/**
 * Google Maps draws into a SurfaceView, which makes Android keep a "transparent region" hint for
 * the whole window: the parts not covered by opaque views, where the map below is allowed to show.
 * ViewRootImpl recomputes that hint only during its own layout pass, and React Native never asks
 * for one: ReactViewGroup.requestLayout() is a no-op and Fabric positions views directly. A view
 * that appears over the map (the tablet photo panel) therefore stays marked transparent, and the
 * map bleeds through along its edges until something else relayouts the window, such as a tab
 * switch that hides and shows the SurfaceView.
 */
class WindowRegionModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("WindowRegion")

    // Asks the decor view for a layout pass so ViewRootImpl gathers the transparent region again.
    // Children keep their frames, so nothing moves; only the region and a full redraw follow.
    Function("refresh") {
      val decorView = appContext.currentActivity?.window?.decorView
      decorView?.post { decorView.requestLayout() }
      Unit
    }
  }
}
