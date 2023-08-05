import { FC, useMemo } from 'react'
import React, { useEffect, useState } from 'react'
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps'
import { StyleSheet, View, Button, Text, TouchableOpacity } from 'react-native'
import ApiService from '../api/PastVuApi'
import { MapScreenNavigationProp, Propss } from '../types/Navigation.types'
import { StartRoutes } from '../navigation/Routes'
import { PhotoPage } from './PhotoView'
import * as Location from 'expo-location'
import { observer } from 'mobx-react-lite'
import apiStore from '../mobxStore/apiStore'
import { SafeAreaView } from 'react-native-safe-area-context'
import styled from 'styled-components/native'
import { YearsSlider } from '../components/YearsSliderComponent'
import { Storage } from '../Storage/Storage'
import { Root } from '../types/apiPhotoInfo'
import { getColor } from '../utils/getColor'

const loc: Region = {
	latitude: 55.763307,
	longitude: 37.576945,
	latitudeDelta: 0.01,
	longitudeDelta: 0.01
}

export const MapComponent: React.FC<MapScreenNavigationProp> = observer(
	({ navigation }) => {
		const saveRangeYears = Storage.getString('RangeYears')
		const [items, setItems] = useState<itemPhotoArray[]>([])
		const [coordinates, setCoordinates] = useState<Region>(loc)
		const [yearsRange, setYearsRange] = useState<YearsRangeType>(
			saveRangeYears ? JSON.parse(saveRangeYears) : [1900, 1916]
		)
		const { countPhoto, maxDistance } = apiStore

		const handleButtonPress = async (cid: string) => {
			const PhotoJson: Root = await ApiService.getPhotoInfo(cid)
			navigation.navigate(StartRoutes.PhotoPage, { PhotoJson })
		}

		const handleRegionChangeComplete = (region: Region) => {
			setCoordinates(region)
		}

		async function exampleUsage() {
			try {
				await Location.requestForegroundPermissionsAsync()
				const params: getPhotoListProps = {
					latitude: coordinates.latitude,
					longitude: coordinates.longitude,
					limit: countPhoto,
					distance: maxDistance,
					yearStart: yearsRange[0],
					yearEnd: yearsRange[1]
				}
				const photoArray: itemPhotoArray[] = await ApiService.getPhotoList(
					params
				)
				setItems(prevItems => [
					...prevItems,
					...photoArray.map(item => ({
						title: item.title,
						cid: item.cid,
						location: {
							latitude: item.location.latitude,
							longitude: item.location.longitude
						},
						year: item.year
					}))
				])
			} catch (error) {
				console.error(error)
			}
		}

		useMemo(() => {
			exampleUsage()
		}, [coordinates])

		useMemo(() => {
			setItems([])
			exampleUsage()
		}, [yearsRange])

		return (
			<SafeAreaView>
				<View style={{ position: 'relative', height: '100%', width: '100%' }}>
					<MapView
						style={{ height: '100%', width: '100%', position: 'absolute' }}
						initialRegion={coordinates}
						provider={PROVIDER_GOOGLE}
						onRegionChangeComplete={handleRegionChangeComplete}
						showsUserLocation={true}
					>
						{items.map((marker, index) => (
							<Marker
								key={index}
								coordinate={marker.location}
								title={marker.title}
								onPress={() => handleButtonPress(marker.cid)}
								pinColor={getColor(marker.year)}
							/>
						))}
					</MapView>
					<YearsSlider value={yearsRange} setValue={setYearsRange} />
				</View>
			</SafeAreaView>
		)
	}
)

export const MapContainer = styled.View`
	flex-direction: column;
	width: 100%;
`
export const Slider = styled.View`
	background-color: aqua;
	width: 100%;
	height: 50px;
`
