import { FC, memo } from 'react'
import styled from 'styled-components/native'
import { MaterialIcons } from '@expo/vector-icons'
import * as Location from 'expo-location'
import { Region } from 'react-native-maps'
import { DefaultTheme, useTheme } from 'styled-components'
import { Alert } from 'react-native'

type LocationButtonProps = {
  setCoord: (region: Region) => void
}

const GetLocationButton: FC<LocationButtonProps> = ({ setCoord }) => {
  const theme: DefaultTheme = useTheme()
  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Ошибка', 'У приложения нет доступа к геопозиции')
      return
    }
    let location = await Location.getCurrentPositionAsync({})
    setCoord({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    })
  }
  return (
    <ContainerIcon onPress={getLocation}>
      <MaterialIcons name="my-location" size={24} color={theme.colors.textFirst} />
    </ContainerIcon>
  )
}

export const LocationButton = memo(GetLocationButton)

const ContainerIcon = styled.TouchableOpacity`
  background-color: ${props => props.theme.colors.backgroundApp};
  padding: 16px;
  border-radius: 100px;
  position: absolute;
  bottom: 120;
  right: 16;
`
