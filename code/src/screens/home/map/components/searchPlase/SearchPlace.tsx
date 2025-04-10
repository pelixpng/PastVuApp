import { FC, memo, useState } from 'react'
import { View, FlatList } from 'react-native'
import { DefaultTheme, useTheme } from 'styled-components'
import { MaterialIcons } from '@expo/vector-icons'
import { LocationItem } from '../../../../../types/apiPhotoList'
import { Ball, Input, ResultText, RowContainer, s, SearchContainer } from './style'

type LocationSearchProps = {
  places: LocationItem[]
  query: string
  setQueryPlace: (query: string) => void
  goToLocation: (latitude: number, longitude: number) => void
}

type RowProps = {
  text: string
  onPress: () => void
}

const RenderRow: FC<RowProps> = ({ text, onPress }) => (
  <RowContainer onPress={onPress}>
    <Ball />
    <ResultText numberOfLines={1}>{text}</ResultText>
  </RowContainer>
)

const LocationSearch: FC<LocationSearchProps> = ({
  places,
  query,
  goToLocation,
  setQueryPlace,
}) => {
  const theme: DefaultTheme = useTheme()
  const [isFocused, setIsFocused] = useState(false)
  return (
    <View style={s.container}>
      <SearchContainer>
        <MaterialIcons name="search" size={24} color={theme.colors.textThird} />
        <Input
          placeholder="Поиск..."
          placeholderTextColor={theme.colors.textSecond}
          value={query}
          onChangeText={setQueryPlace}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {query.length > 0 && (
          <MaterialIcons
            name="close"
            size={20}
            color={theme.colors.textThird}
            onPress={() => setQueryPlace('')}
          />
        )}
      </SearchContainer>
      {isFocused && places.length > 0 && (
        <FlatList
          data={places}
          scrollEnabled={false}
          keyboardShouldPersistTaps={'always'}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={[s.list, { backgroundColor: theme.colors.backgroundApp }]}
          renderItem={({ item }) => (
            <RenderRow
              text={item.display_name}
              onPress={() => goToLocation(Number(item.lat), Number(item.lon))}
            />
          )}
        />
      )}
    </View>
  )
}

export const SearchPlace = memo(LocationSearch)
