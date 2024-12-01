import { FC, memo } from 'react'
import { GooglePlaceData, GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'
import { DefaultTheme, useTheme } from 'styled-components'
import { Alert, Platform } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { Ball, ResultText, RowContainer, s } from './style'

type SearchPlaceProp = {
  setCoordinates: (latitude: number, longitude: number) => void
}

const RenderRow: FC<Partial<GooglePlaceData>> = props => {
  return (
    <RowContainer>
      <Ball />
      <ResultText>{props.description}</ResultText>
    </RowContainer>
  )
}

const SearchPlaceComponent: FC<SearchPlaceProp> = ({ setCoordinates }) => {
  const theme: DefaultTheme = useTheme()
  return (
    <GooglePlacesAutocomplete
      placeholder="Поиск"
      textInputProps={{
        placeholderTextColor: theme.colors.textSecond,
        returnKeyType: 'search',
        clearButtonMode: 'while-editing',
      }}
      renderRow={data => <RenderRow description={data.description} />}
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
        setCoordinates(details?.geometry.location.lat, details?.geometry.location.lng)
      }}
      query={{
        language: 'ru',
        key: 'YOUR API KEY',
      }}
      enablePoweredByContainer={false}
      renderLeftButton={() => (
        <MaterialIcons name={'search'} size={24} color={theme.colors.textThird} />
      )}
      styles={{
        container: [s.container, Platform.OS === 'ios' && s.shadow],
        separator: s.separator,
        textInputContainer: [
          s.textInputContainer,
          { backgroundColor: theme.colors.backgroundApp },
          Platform.OS === 'android' && s.shadow,
        ],
        row: s.row,
        textInput: [
          s.textInput,
          { color: theme.colors.textFirst, backgroundColor: theme.colors.backgroundApp },
        ],
        listView: [
          s.listView,
          { backgroundColor: theme.colors.backgroundApp },
          Platform.OS === 'android' && s.shadow,
        ],
      }}
    />
  )
}

export const SearchPlace = memo(SearchPlaceComponent)
