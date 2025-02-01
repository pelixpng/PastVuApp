import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { SCREENS } from '../navigation/navigation.types'

type RootStackParamList = {
  [SCREENS.HOME]: undefined
  [SCREENS.HOME_HISTORY]: undefined
  [SCREENS.HOME_MAP]: undefined
  [SCREENS.HOME_SETTINGS]: undefined
  [SCREENS.PHOTO_VIEW]: { cid: string }
  [SCREENS.SETTINGS_ABOUT_APP]: undefined
  [SCREENS.SETTINGS_FEEDBACK]: undefined
  [SCREENS.SETTINGS_MAP]: undefined
}
