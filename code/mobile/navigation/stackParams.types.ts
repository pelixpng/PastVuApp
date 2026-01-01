import { SCREENS } from './navigation.types'

export type StackParamList = {
  [SCREENS.BOTTOM_TAB_NAVIGATOR]: undefined
  [SCREENS.MAP]: undefined
  [SCREENS.PHOTO_HISTORY]: undefined
  [SCREENS.SETTINGS_MENU]: undefined
  [SCREENS.PHOTO_DETAIL]: { cid: string; title: string }
  [SCREENS.FULL_SCREEN_IMAGE]: { uri: string; title: string; cid: string; file: string }
  [SCREENS.ABOUT_APP]: undefined
  [SCREENS.SUPPORT_CONTACTS]: undefined
  [SCREENS.APP_SETTINGS]: undefined
} & Record<SCREENS, object | undefined>
