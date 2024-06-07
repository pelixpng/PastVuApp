import { useState } from 'react'
import { ViewContainer } from '../../components/ui/UniversalComponents'
import { MaterialIcons } from '@expo/vector-icons'
import { InsideMenuComponent } from '../../components/ui/InsideMenuComponent'
import { MyButton } from '../../components/buttons/MyButton'
import * as Location from 'expo-location'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { MMKVStorage } from '../../storage/Storage'
import { RootStackParamList } from '../../types/navigation'
import { perfectSize } from '../../utils/ScreenSize'
import { Alert, StyleSheet } from 'react-native'

export const StartScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()
  const [isPermission, setIsPermission] = useState(false)
  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync()
    if (status !== 'granted') {
      return Alert.alert('Ошибка', 'У приложения нет доступа к геопозиции')
    }
    setIsPermission(true)
    const lastPosition = await Location.getLastKnownPositionAsync()
    if (lastPosition) {
      MMKVStorage.set('RegionString', {
        latitude: lastPosition.coords.latitude,
        longitude: lastPosition.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      })
    } else {
      const { coords } = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Lowest,
      })
      MMKVStorage.set('RegionString', {
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
