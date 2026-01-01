import { getDeviceType } from 'react-native-device-info'
import AppTablet from './tablet/AppTablet'
import AppMobile from './mobile/AppMobile'
import { useEffect } from 'react'
import * as ScreenOrientation from 'expo-screen-orientation'

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
  }, [])

  return isShowTabletUI ? <AppTablet /> : <AppMobile />
}
