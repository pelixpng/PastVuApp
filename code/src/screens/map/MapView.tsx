import React, { useState, useMemo } from 'react'
import { Region } from 'react-native-maps'
import { View } from 'react-native'
import ApiService from '../../../api/PastVuApi'
import { RootStackParamList } from '../../types/Navigation'
import { observer } from 'mobx-react-lite'
import { SafeAreaView } from 'react-native-safe-area-context'
import { YearsSlider } from '../../components/sliders/YearsSliderComponent'
import StorageServiceMMKV, { Storage } from '../../Storage/Storage'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import SettingsMapStore from '../../mobx/SettingsMapStore'
import { LocationButton } from '../../components/buttons/LocationButton'
import { SearchPlace } from '../../components/map/SearchPlace'
import { GoogleMap } from '../../components/map/Map'
import * as Location from 'expo-location'
import { itemPhotoArray, getPhotoListProps } from '../../types/apiPhotoList'

const loc: Region = {
	latitude: 55.763307,
	longitude: 37.576945,
	latitudeDelta: 0.01,
	longitudeDelta: 0.01
}

type mainNavProps = NavigationProp<RootStackParamList>

export const MapComponent: React.FC = observer(() => {
	const saveRangeYears = Storage.getString('RangeYears')
	const saveRegion = Storage.getString('RegionString')
	const [items, setItems] = useState<itemPhotoArray[]>([])
	const [coordinates, setCoordinates] = useState<Region>(
		saveRegion ? JSON.parse(saveRegion) : loc
	)
	const [yearsRange, setYearsRange] = useState<YearsRangeType>(
		saveRangeYears ? JSON.parse(saveRangeYears) : [1840, 1916]
	)
	const { countPhoto, maxDistance } = SettingsMapStore
	const navigation = useNavigation<mainNavProps>()
	const handleButtonPress = async (cid: string) => {
		const PhotoJson: PhotoInfo = await ApiService.getPhotoInfo(cid)
		navigation.navigate('PhotoPage', { PhotoJson })
	}
	async function getPhoto() {
		try {
			const params: getPhotoListProps = {
				latitude: coordinates.latitude,
				longitude: coordinates.longitude,
				limit: countPhoto,
				distance: maxDistance,
				yearStart: yearsRange[0],
				yearEnd: yearsRange[1]
			}
			const photoArray: itemPhotoArray[] = await ApiService.getPhotoList(params)
			setItems(prevItems => [
				...prevItems,
				...photoArray.map(item => ({
					title: item.title,
					cid: item.cid,
					location: {
						latitude: item.location.latitude,
						longitude: item.location.longitude
					},
					year: item.year,
					dir: item.dir,
					color: item.color
				}))
			])
		} catch (error) {
			console.log(error)
		}
	}

	useMemo(() => {
		StorageServiceMMKV.saveRegion(coordinates)
		items.length > 100 && setItems([])
		getPhoto()
	}, [coordinates])

	useMemo(() => {
		setItems([])
		getPhoto()
	}, [yearsRange])

	return (
		<SafeAreaView>
			<View style={{ position: 'relative', height: '100%', width: '100%' }}>
				<SearchPlace setCoordinates={setCoordinates} />
				<GoogleMap
					setCoordinates={setCoordinates}
					coordinates={coordinates}
					items={items}
					handleButtonPress={handleButtonPress}
				/>
				<LocationButton setCoord={setCoordinates} />
				<YearsSlider value={yearsRange} setValue={setYearsRange} />
			</View>
		</SafeAreaView>
	)
})
