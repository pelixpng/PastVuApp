import { SCREENS } from './navigation.types'
import type { FullScreenParams } from '../../core/services/photoPost'

export type StackParamList = {
  [SCREENS.BOTTOM_TAB_NAVIGATOR]: undefined
  [SCREENS.MAP]: undefined
  [SCREENS.PHOTO_HISTORY]: undefined
  [SCREENS.NEWS]: undefined
  [SCREENS.SETTINGS_MENU]: undefined
  [SCREENS.FULL_SCREEN_IMAGE]: FullScreenParams
  [SCREENS.PROFILE]: { login: string }
} & Record<SCREENS, object | undefined>
