import { FC } from 'react'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'
import { DefaultTheme, useTheme } from 'styled-components'
import { Region } from 'react-native-maps'
import React from 'react'
import { perfectSize } from '../../utils/ScreenSize'
import { Alert, StyleSheet } from 'react-native'
import { INSET_TOP } from '../../constants/sizes'

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
        Alert.alert(
          'Ошибка',
          error.includes('quota')
            ? 'К сожалению, ежедневный лимит поисковых запросов исчерпан. Попробуйте завтра.'
            : error,
        )
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
        container: s.container,
        textInput: {
          borderRadius: 30,
          backgroundColor: theme.colors.backgroundApp,
          color: theme.colors.MenuDescriptionText,
          fontSize: perfectSize(15),
        },
        row: {
          backgroundColor: theme.colors.backgroundApp,
        },
        description: {
          color: theme.colors.MenuDescriptionText,
          fontSize: perfectSize(15),
          lineHeight: perfectSize(15),
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

const s = StyleSheet.create({
  container: {
    width: '95%',
    alignSelf: 'center',
    position: 'absolute',
    zIndex: 9,
    marginTop: INSET_TOP,
  },
})

export const SearchPlace = React.memo(SearchPlaceComponent)
