import { getDeviceType } from 'react-native-device-info'
import AppTablet, { NavigationRef as TabletNavigation } from './tablet/AppTablet'
import AppMobile, { NavigationRef as PhoneNavigation } from './mobile/AppMobile'
import { useEffect, useLayoutEffect, useState } from 'react'
import { Alert, Platform } from 'react-native'
import {
  SafeAreaProvider,
  initialWindowMetrics,
  useSafeAreaFrame,
  useSafeAreaInsets,
} from 'react-native-safe-area-context'
import { MMKVStorage } from './core/storage/mmkv'
import { t } from './core/i18n'
import { UiHandoff } from './core/store/UiHandoff'
import { ANDROID_TABLET_MIN_WIDTH, UNFOLDED_MIN_WIDTH } from './tablet/hooks/useTabletLayout'
import { capturePhoneState } from './mobile/navigation/handoff'
import { captureTabletState } from './tablet/navigation/handoff'

type Interface = 'phone' | 'tablet'

/** An iPad or a Mac: the tablet interface at every window size (see ios/PastVu/SceneDelegate). */
const TABLET_DEVICE =
  Platform.OS === 'ios' && ['Tablet', 'Desktop', 'GamingConsole'].includes(getDeviceType())

export default function App() {
  useEffect(() => {
    const isFirstLaunch = MMKVStorage.get('isFirstLaunch')
    if (isFirstLaunch) return
    MMKVStorage.set('isFirstLaunch', 'done')
    // Triggered by the device locale, since the notice is about where the user is rather than
    // which language they read in -- but worded in the interface language, which can differ.
    const locale = Intl.DateTimeFormat().resolvedOptions().locale
    if (locale.toLowerCase().includes('ru')) {
      Alert.alert(t('firstLaunch.russiaTitle'), t('firstLaunch.russiaText'), [{ text: 'OK' }])
    }
  }, [])

  return (
    // One safe-area provider for both interfaces, so the one taking over when the device folds
    // starts from the window's size now, not from its size at launch.
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <AppInterface />
    </SafeAreaProvider>
  )
}

/**
 * Which interface the window is wide enough for. An iPhone that unfolds to a wide screen (iPhone
 * Duo, with an inner display of 951x669 pt) gets the tablet's in either orientation, as Apple
 * expects a richer layout there, and the phone's again when folded or in half of Split View. The
 * width is what is left beside the side insets, which on iPhone Duo hold the vertical bar.
 *
 * Android has no such device type to go by once running: a foldable moves between its screens
 * in the same process (Pixel Fold: a cover of 443 dp, an inner screen of 852x883), and
 * react-native-device-info reads the type once, at launch. So the window's width decides there,
 * at the line the type was drawn at, and MainActivity locks phones upright by it: a tablet is as
 * wide as before in either orientation, a phone is upright and narrower. The width alone, as the
 * keyboard shortens the window on Android; a split-screen window narrower than the line gets the
 * phone's interface too.
 */
const useInterface = (): Interface => {
  const { width } = useSafeAreaFrame()
  const { left, right } = useSafeAreaInsets()
  if (Platform.OS === 'android') return width >= ANDROID_TABLET_MIN_WIDTH ? 'tablet' : 'phone'
  if (TABLET_DEVICE) return 'tablet'
  return width - left - right >= UNFOLDED_MIN_WIDTH ? 'tablet' : 'phone'
}

const AppInterface = () => {
  const wanted = useInterface()
  const [shown, setShown] = useState(wanted)
  // Before the outgoing interface goes, while it is still mounted, it says where the user was, so
  // the incoming one opens on the same tab and photo (see core/store/UiHandoff). A layout effect,
  // so the outgoing interface is never painted at the new size.
  useLayoutEffect(() => {
    if (wanted === shown) return
    UiHandoff.put(
      shown === 'phone'
        ? capturePhoneState(PhoneNavigation)
        : captureTabletState(TabletNavigation),
    )
    setShown(wanted)
  }, [wanted, shown])
  return shown === 'tablet' ? <AppTablet /> : <AppMobile />
}
