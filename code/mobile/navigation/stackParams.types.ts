import { SCREENS } from './navigation.types'
import { NewsItems } from '../../core/types/apiNews.d'
import { StreetViewTarget } from '../../core/services/streetView'
import { CompareMode, ComparePhoto } from '../../core/components/compare/CompareView'

export type StackParamList = {
  [SCREENS.BOTTOM_TAB_NAVIGATOR]: undefined
  [SCREENS.MAP]: undefined
  [SCREENS.PHOTO_HISTORY]: undefined
  [SCREENS.NEWS]: undefined
  [SCREENS.SETTINGS_MENU]: undefined
  [SCREENS.PHOTO_DETAIL]: { cid: string; title: string }
  [SCREENS.FULL_SCREEN_IMAGE]: { uri: string; title: string; cid: string; file: string }
  [SCREENS.COMPARE]: {
    photo: ComparePhoto
    mode: CompareMode
    target?: StreetViewTarget | null
    year?: number
  }
  [SCREENS.NEWS_POST]: NewsItems
  [SCREENS.ABOUT_APP]: undefined
  [SCREENS.SUPPORT_CONTACTS]: undefined
  [SCREENS.APP_SETTINGS]: undefined
} & Record<SCREENS, object | undefined>
