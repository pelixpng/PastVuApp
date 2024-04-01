import React, { FC, useState } from 'react'
import { ViewContainer } from '../../components/ui/UniversalComponents'
import { MaterialIcons } from '@expo/vector-icons'
import { InsideMenuComponent } from '../../components/ui/InsideMenuComponent'
import { MyButton } from '../../components/buttons/MyButton'
import * as Location from 'expo-location'
import AlertModalService from '../../utils/AlertModalService'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import StorageServiceMMKV from '../../storage/Storage'
import { RootStackParamList } from '../../types/navigation'
import { perfectSize } from '../../utils/ScreenSize'
import { StyleSheet } from 'react-native'

export const StartScreen: FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()
  const [isPermission, setIsPermission] = useState(false)
  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync()
    if (status !== 'granted') {
      AlertModalService.infoAlert('Ошибка', 'У приложения нет доступа к геопозиции')
    } else {
      setIsPermission(true)
      StorageServiceMMKV.saveLaunchStatus(true)
      const lastPosition = await Location.getLastKnownPositionAsync()
      if (lastPosition) {
        StorageServiceMMKV.saveRegion({
          latitude: lastPosition.coords.latitude,
          longitude: lastPosition.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        })
      } else {
        const { coords } = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Lowest,
        })
        StorageServiceMMKV.saveRegion({
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        })
      }
      navigation.reset({
        index: 0,
        routes: [{ name: 'MapComponent' }],
      })
    }
  }
  return (
    <ViewContainer>
      <MaterialIcons name="location-on" size={perfectSize(200)} color={'#438BF9'} style={s.icon} />
      <InsideMenuComponent
        title={isPermission ? 'Определяем ваше местоположение...' : 'Доступ к геопозиции'}
        description={
          isPermission
            ? 'Если процесс занимает слишком много времени, вы можете нажать кнопку Пропустить.'
            : 'Чтобы просмотреть фотографии поблизости, разрешите доступ к вашему местоположению.'
        }>
        {!isPermission && <MyButton title={'Разрешить'} func={getLocation} />}
        <MyButton
          title={'Пропустить'}
          func={() => {
            StorageServiceMMKV.saveLaunchStatus(true)
            navigation.reset({
              index: 0,
              routes: [{ name: 'MapComponent' }],
            })
          }}
        />
      </InsideMenuComponent>
    </ViewContainer>
  )
}

const s = StyleSheet.create({
  icon: { alignSelf: 'center' },
})
