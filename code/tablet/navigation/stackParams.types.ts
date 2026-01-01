import { SCREENS } from './navigation.types'

export type StackParamList = {
  [SCREENS.BOTTOM_TAB_NAVIGATOR]: undefined
  [SCREENS.MAP]: undefined
  [SCREENS.PHOTO_HISTORY]: undefined
  [SCREENS.SETTINGS_MENU]: undefined
  [SCREENS.FULL_SCREEN_IMAGE]: { uri: string; title: string; cid: string; file: string }
} & Record<SCREENS, object | undefined>
