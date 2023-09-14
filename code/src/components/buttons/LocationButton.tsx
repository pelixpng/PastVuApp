import React, { FC } from 'react'
import styled from 'styled-components/native'
import { Ionicons } from '@expo/vector-icons'
import * as Location from 'expo-location'
import { Region } from 'react-native-maps'
import { DefaultTheme, useTheme } from 'styled-components'
import AlertModalService from '../../utils/AlertModalService'

type LocationButtonProps = {
	setCoord: (region: Region) => void
}

const GetLocationButton: FC<LocationButtonProps> = ({ setCoord }) => {
	console.log('MEMOOO')
	const theme: DefaultTheme = useTheme()
	const getLocation = async () => {
		let { status } = await Location.requestForegroundPermissionsAsync()
		if (status !== 'granted') {
			AlertModalService.userLoactinoError()
		}
		let location = await Location.getCurrentPositionAsync({})
		setCoord({
			latitude: location.coords.latitude,
			longitude: location.coords.longitude,
			latitudeDelta: 0.01,
			longitudeDelta: 0.01
		})
	}
	return (
		<Container>
			<ContainerIcon onPress={() => getLocation()}>
				<Ionicons
					name="ios-location-sharp"
					size={24}
					color={theme.colors.titleMenuText}
				/>
			</ContainerIcon>
		</Container>
	)
}

export const LocationButton = React.memo(GetLocationButton)

const Container = styled.View`
	width: 95%;
	position: absolute;
	bottom: 130px;
	z-index: 10;
	align-self: center;
`

const ContainerIcon = styled.TouchableOpacity`
	background-color: ${props => props.theme.colors.backgroundApp};
	align-self: flex-end;
	padding: 11px;
	border-radius: 50px;
`
