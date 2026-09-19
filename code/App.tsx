import { getDeviceType } from 'react-native-device-info'
import AppTablet from './tablet/AppTablet'
import AppMobile from './mobile/AppMobile'
import { useEffect } from 'react'
import * as ScreenOrientation from 'expo-screen-orientation'
import { Alert } from 'react-native'
import { MMKVStorage } from './core/storage/mmkv'
import { t } from './core/i18n'
import { initYandexMaps } from './core/services/yandexMaps'

export default function App() {
  const typeDevice = getDeviceType()
  const isShowTabletUI = ['Tablet', 'Desktop', 'GamingConsole'].includes(typeDevice)
  useEffect(() => {
    const lockOrientation = async () => {
      await ScreenOrientation.lockAsync(
        isShowTabletUI
          ? ScreenOrientation.OrientationLock.LANDSCAPE
          : ScreenOrientation.OrientationLock.PORTRAIT_UP,
      )
    }
    lockOrientation()
  }, [isShowTabletUI])

  useEffect(() => {
    initYandexMaps()
  }, [])

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

  return isShowTabletUI ? <AppTablet /> : <AppMobile />
}
