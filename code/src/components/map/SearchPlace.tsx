import { FC } from 'react'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'
import { DefaultTheme, useTheme } from 'styled-components'
import { Region } from 'react-native-maps'
import React from 'react'
import AlertModalService from '../../utils/AlertModalService'
import { perfectSize } from '../../utils/ScreenSize'

type SearchPlaceProp = {
  setCoordinates: (region: Region) => void
}

const SearchPlaceComponent: FC<SearchPlaceProp> = ({ setCoordinates }) => {
  const theme: DefaultTheme = useTheme()
  return (
    <GooglePlacesAutocomplete
      placeholder="Поиск"
      textInputProps={{
        placeholderTextColor: theme.colors.MenuDescriptionText,
        returnKeyType: 'search',
      }}
      fetchDetails={true}
      onFail={(error: string) => {
        error.includes('quota')
          ? AlertModalService.infoAlert(
              'Ошибка',
              'К сожалению, ежедневный лимит поисковых запросов исчерпан. Попробуйте завтра.',
            )
          : AlertModalService.infoAlert('ОШИБКА', error)
      }}
      onPress={(data, details = null) => {
        setCoordinates({
          latitude: details?.geometry.location.lat,
          longitude: details?.geometry.location.lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        })
      }}
      query={{
        key: 'YOUR_GOOGLE_MAPS_API_KEY',
        language: 'ru',
      }}
      styles={{
        container: {
          width: '95%',
          alignSelf: 'center',
          position: 'absolute',
          zIndex: 9,
          marginTop: perfectSize(10),
        },
        textInput: {
          borderRadius: 30,
          backgroundColor: theme.colors.backgroundApp,
          color: theme.colors.MenuDescriptionText,
          fontSize: perfectSize(16),
          lineHeight: perfectSize(16),
        },
        row: {
          backgroundColor: theme.colors.backgroundApp,
        },
        description: {
          color: theme.colors.MenuDescriptionText,
          fontSize: perfectSize(16),
          lineHeight: perfectSize(16),
        },
        listView: {
          backgroundColor: theme.colors.backgroundApp,
          borderRadius: 30,
        },
        separator: {
          backgroundColor: theme.colors.backgroundApp,
        },
        poweredContainer: {
          borderBottomRightRadius: 30,
          borderBottomLeftRadius: 30,
          backgroundColor: theme.colors.backgroundApp,
        },
      }}
    />
  )
}

export const SearchPlace = React.memo(SearchPlaceComponent)
