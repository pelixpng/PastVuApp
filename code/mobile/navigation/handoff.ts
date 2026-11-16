import {
  InitialState,
  NavigationContainerRef,
  NavigationState,
  ParamListBase,
  PartialState,
} from '@react-navigation/native'
import { RefObject } from 'react'
import { HandoffPhoto, HandoffState, UiHandoff, phonePhotoKey } from '../../core/store/UiHandoff'
import { SCREENS } from './navigation.types'
import { StackParamList } from './stackParams.types'

type StackRoute = NavigationState['routes'][number]

/** The photo a photo screen shows, which can be another than its route's: links open in place. */
const shownPhoto = (route: StackRoute): HandoffPhoto | null =>
  UiHandoff.panelPhoto(phonePhotoKey(route.key)) ??
  (route.params as StackParamList[SCREENS.PHOTO_DETAIL] | undefined) ??
  null

/**
 * Where the phone interface is, for the tablet interface replacing it (see core/store/UiHandoff):
 * the tab under the stack, and the photo screen nearest the top, wherever it was opened from. A
 * profile above it goes instead, with the photo opened from it, if that is on top of it.
 */
export const capturePhoneState = (
  navigation: RefObject<NavigationContainerRef<ParamListBase> | null>,
): HandoffState | null => {
  const root = navigation.current?.getRootState()
  if (!root) return null
  const tabs = root.routes.find(route => route.name === SCREENS.BOTTOM_TAB_NAVIGATOR)?.state
  const tab = tabs?.routes[tabs.index ?? 0]?.name ?? SCREENS.MAP
  const stack = root.routes.slice(0, root.index + 1)
  const topmost = (name: string) => stack.map(route => route.name).lastIndexOf(name)
  const photoAt = topmost(SCREENS.PHOTO_DETAIL)
  const profileAt = topmost(SCREENS.PROFILE)
  if (profileAt >= 0) {
    const { login } = stack[profileAt].params as StackParamList[SCREENS.PROFILE]
    const photo = photoAt > profileAt ? shownPhoto(stack[photoAt]) : null
    return { tab, photo: null, profile: { login, photo } }
  }
  return { tab, photo: photoAt >= 0 ? shownPhoto(stack[photoAt]) : null }
}

/**
 * The phone's navigation to start from after the tablet interface: the same tab, with the photo
 * opened over it, or the profile and the photo opened from it. The tab navigator fills in the tabs
 * left out.
 */
export const phoneInitialState = (): InitialState | undefined => {
  const handoff = UiHandoff.peek()
  UiHandoff.clear()
  if (!handoff) return undefined
  const photo: HandoffPhoto | null = handoff.photo
  const routes: PartialState<NavigationState>['routes'] = [
    {
      name: SCREENS.BOTTOM_TAB_NAVIGATOR,
      state: { routes: [{ name: handoff.tab }] },
    },
  ]
  const { profile } = handoff
  if (profile) routes.push({ name: SCREENS.PROFILE, params: { login: profile.login } })
  const shown = profile ? profile.photo : photo
  if (shown) routes.push({ name: SCREENS.PHOTO_DETAIL, params: shown })
  return { routes, index: routes.length - 1 }
}
