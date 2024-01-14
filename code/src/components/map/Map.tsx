import { FC } from 'react'
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps'
import { CustomMarker } from './CustomMarker'
import { DefaultTheme, useTheme } from 'styled-components'
import { itemPhotoArray } from '../../types/apiPhotoList'
import { observer } from 'mobx-react-lite'
import SettingsMapStore from '../../mobx/SettingsMapStore'

type MapProp = {
	setCoordinates: (region: Region) => void
	coordinates: Region
	items: itemPhotoArray[]
	handleButtonPress: (cid: string) => void
}

export const GoogleMap: FC<MapProp> = observer(
	({ setCoordinates, coordinates, items, handleButtonPress }) => {
		const theme: DefaultTheme = useTheme()
		const mapTypeSetting = SettingsMapStore.mapTypeSetting
		return (
			<MapView
				style={{ height: '100%', width: '100%', position: 'absolute' }}
				provider={PROVIDER_GOOGLE}
				onRegionChangeComplete={setCoordinates}
				showsUserLocation={true}
				showsMyLocationButton={false}
				region={coordinates}
				showsBuildings={true}
				customMapStyle={theme.colors.MapTheme}
				loadingBackgroundColor={theme.colors.backgroundApp}
				moveOnMarkerPress={false}
				rotateEnabled={false}
				maxZoomLevel={18}
				mapType={mapTypeSetting}
			>
				{items.map((marker, index) => (
					<Marker
						key={index}
						coordinate={marker.location}
						title={marker.title}
						onPress={() => handleButtonPress(marker.cid)}
						rotation={marker.dir}
						pinColor={marker.color}
						tracksViewChanges={false}
					>
						{marker.dir == 0 && <CustomMarker color={marker.color} />}
					</Marker>
				))}
			</MapView>
		)
	}
)
