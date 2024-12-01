import { FC, memo } from 'react'
import styled from 'styled-components/native'
import { MaterialIcons } from '@expo/vector-icons'
import { DefaultTheme, useTheme } from 'styled-components'

type LocationButtonProps = {
  onPress: () => void
}

const GetLocationButton: FC<LocationButtonProps> = ({ onPress }) => {
  const theme: DefaultTheme = useTheme()
  return (
    <ContainerIcon onPress={onPress}>
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
