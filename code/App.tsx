import { getDeviceType } from 'react-native-device-info'
import AppTablet from './tablet/AppTablet'
import AppMobile from './mobile/AppMobile'
import { useEffect } from 'react'
import * as ScreenOrientation from 'expo-screen-orientation'
import { Alert } from 'react-native'
import { MMKVStorage } from './core/storage/mmkv'

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
    const isFirstLaunch = MMKVStorage.get('isFirstLaunch')
    if (isFirstLaunch) return
    MMKVStorage.set('isFirstLaunch', 'done')
    const locale = Intl.DateTimeFormat().resolvedOptions().locale
    if (locale.toLowerCase().includes('ru')) {
      Alert.alert(
        'Для пользователей из России',
        'Из-за блокировки Cloudflare приложение и сайт Pastvu.com могут временно не работать на территории России.',
        [{ text: 'OK' }],
      )
    }
  }, [])

  return isShowTabletUI ? <AppTablet /> : <AppMobile />
}
