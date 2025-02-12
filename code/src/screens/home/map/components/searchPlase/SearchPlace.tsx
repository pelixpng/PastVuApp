import { FC, memo } from 'react'
import { GooglePlaceData, GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'
import { DefaultTheme, useTheme } from 'styled-components'
import { Alert, Platform } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { Ball, ResultText, RowContainer, s } from './style'

type SearchPlaceProp = {
  goToLocation: (latitude: number, longitude: number) => void
}

const RenderRow: FC<Partial<GooglePlaceData>> = ({ description }) => (
  <RowContainer>
    <Ball />
    <ResultText>{description || 'Нет описания'}</ResultText>
  </RowContainer>
)

const handleSearchError = (error: string) => {
  const isQuotaExceeded = error.includes('quota')
  Alert.alert(
    'Ошибка',
    isQuotaExceeded
      ? 'К сожалению, ежедневный лимит поисковых запросов для всех пользователей исчерпан. Попробуйте завтра.'
      : error,
  )
}

const SearchPlaceComponent: FC<SearchPlaceProp> = ({ goToLocation }) => {
  const theme: DefaultTheme = useTheme()
  const backgroundStyle = { backgroundColor: theme.colors.backgroundApp }
  const shadowStyle = Platform.OS === 'android' ? s.shadow : null
  return (
    <GooglePlacesAutocomplete
      placeholder="Поиск"
      textInputProps={{
        placeholderTextColor: theme.colors.textSecond,
        returnKeyType: 'search',
        clearButtonMode: 'while-editing',
      }}
      minLength={2}
      renderRow={data => <RenderRow description={data.description} />}
      fetchDetails={true}
      onFail={handleSearchError}
      onPress={(data, details) => {
        if (details) {
          const { lat, lng } = details.geometry.location
          goToLocation(lat, lng)
        }
      }}
      query={{
        language: 'ru',
        key: '',
      }}
      enablePoweredByContainer={false}
      renderLeftButton={() => (
        <MaterialIcons name="search" size={24} color={theme.colors.textThird} />
      )}
      styles={{
        container: [s.container, shadowStyle],
        separator: s.separator,
        textInputContainer: [s.textInputContainer, backgroundStyle, shadowStyle],
        row: s.row,
        textInput: [s.textInput, { color: theme.colors.textFirst, ...backgroundStyle }],
        listView: [s.listView, backgroundStyle, shadowStyle],
      }}
    />
  )
}

export const SearchPlace = memo(SearchPlaceComponent)
