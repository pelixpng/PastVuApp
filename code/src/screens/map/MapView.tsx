import React, { useState, useMemo } from 'react'
import { Region } from 'react-native-maps'
import ApiService from '../../api/PastVuApi'
import { observer } from 'mobx-react-lite'
import { YearsSlider } from '../../components/sliders/YearsSliderComponent'
import StorageServiceMMKV, { Storage } from '../../storage/Storage'
import SettingsMapStore from '../../mobx/SettingsMapStore'
import { LocationButton } from '../../components/buttons/LocationButton'
import { SearchPlace } from '../../components/map/SearchPlace'
import { GoogleMap } from '../../components/map/Map'
import { itemPhotoArray, getPhotoListProps } from '../../types/apiPhotoList'
import { HistoryButton } from '../../components/buttons/HistoryButton'
import { YearsRangeType } from '../../types/components'
import AlertModalService from '../../utils/AlertModalService'
import styled from 'styled-components/native'

const loc: Region = {
  latitude: 55.763307,
  longitude: 37.576945,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
}

export const MapComponent: React.FC = observer(() => {
  const saveRangeYears = Storage.getString('RangeYears')
  const saveRegion = Storage.getString('RegionString')
  const [items, setItems] = useState<itemPhotoArray[]>([])
  const [coordinates, setCoordinates] = useState<Region>(saveRegion ? JSON.parse(saveRegion) : loc)
  const [helpersCoordinates, setHelpersCoordinates] = useState<Region>(
    saveRegion ? JSON.parse(saveRegion) : loc,
  )
  const [yearsRange, setYearsRange] = useState<YearsRangeType>(
    saveRangeYears ? JSON.parse(saveRangeYears) : [1840, 1916],
  )
  const { countPhoto, maxDistance, maxPhotoOnMap } = SettingsMapStore
  async function getPhoto() {
    try {
      StorageServiceMMKV.saveRegion(coordinates)
      items.length > maxPhotoOnMap && setItems([])
      const params: getPhotoListProps = {
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        limit: countPhoto,
        distance: maxDistance,
        yearStart: yearsRange[0],
        yearEnd: yearsRange[1],
      }
      const photoArray: itemPhotoArray[] = await ApiService.getPhotoList(params)
      setItems(prevItems => {
        const newItems = photoArray.map(item => ({
          title: item.title,
          cid: item.cid,
          location: {
            latitude: item.location.latitude,
            longitude: item.location.longitude,
          },
          year: item.year,
          dir: item.dir,
          marker: item.marker,
          color: item.color,
        }))
        const uniqueItems = newItems.filter(newItem =>
          prevItems.every(prevItem => prevItem.cid !== newItem.cid),
        )
        return [...prevItems, ...uniqueItems]
      })
    } catch (error) {
      AlertModalService.infoAlert('Ошибка', 'Не удалось получить метки')
    }
  }

  useMemo(() => {
    getPhoto()
  }, [coordinates])

  useMemo(() => {
    setItems([])
    getPhoto()
  }, [yearsRange])

  return (
    <Container>
      <SearchPlace setCoordinates={setHelpersCoordinates} />
      <GoogleMap setCoordinates={setCoordinates} coordinates={helpersCoordinates} items={items} />
      <HistoryButton />
      <LocationButton setCoord={setHelpersCoordinates} />
      <YearsSlider value={yearsRange} setValue={setYearsRange} />
    </Container>
  )
})

const Container = styled.View`
  height: 100%;
  width: 100%;
  position: relative;
  background-color: ${props => props.theme.colors.backgroundApp};
`
