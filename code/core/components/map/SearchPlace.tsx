import { FC, memo, useState } from 'react'
import { View, FlatList, TouchableOpacity, Text, TextInput, StyleSheet } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { useTheme } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LocationItem } from '../../types/apiPhotoList'
import { Spacer } from '../ui/Spacer'

type SearchPlaceProps = {
  places: LocationItem[]
  query: string
  setQueryPlace: (query: string) => void
  goToLocation: (latitude: number, longitude: number) => void
  isTablet?: boolean
}

const LocationSearch: FC<SearchPlaceProps> = ({
  places,
  query,
  goToLocation,
  setQueryPlace,
  isTablet,
}) => {
  const [isFocused, setIsFocused] = useState(false)
  const { colors } = useTheme()
  const { top } = useSafeAreaInsets()
  return (
    <View
      style={[
        s.container,
        { top },
        isTablet
          ? { width: '33%', left: 16, alignSelf: 'flex-start' }
          : { width: '100%', paddingHorizontal: 16 },
      ]}>
      <View style={[s.searchContainer, { backgroundColor: colors.backgroundApp }]}>
        <MaterialIcons name="search" size={25} color={colors.textThird} />
        <Spacer width={5} />
        <TextInput
          style={[s.input, { color: colors.textFirst }]}
          placeholder="Поиск..."
          placeholderTextColor={colors.textSecond}
          value={query}
          onChangeText={setQueryPlace}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {query.length > 0 && (
          <MaterialIcons
            name="close"
            size={21}
            color={colors.textThird}
            onPress={() => setQueryPlace('')}
          />
        )}
      </View>
      <Spacer height={8} />
      {isFocused && places.length > 0 && (
        <FlatList
          data={places}
          scrollEnabled={false}
          keyboardShouldPersistTaps={'always'}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={[s.list, { backgroundColor: colors.backgroundApp }]}
          ItemSeparatorComponent={() => <Spacer height={8} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={s.rowContainer}
              onPress={() => goToLocation(Number(item.lat), Number(item.lon))}>
              <View style={[s.ball, { backgroundColor: colors.baseThird }]} />
              <Spacer width={16} />
              <Text style={[s.resultText, { color: colors.textFirst }]} numberOfLines={1}>
                {item.display_name}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  )
}

const s = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 9,
  },
  list: {
    paddingTop: 12,
    paddingBottom: 12,
    paddingLeft: 20,
    paddingRight: 8,
    borderRadius: 12,
  },
  input: {
    fontSize: 15,
    fontWeight: 'medium',
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingLeft: 12,
    paddingRight: 8,
    height: 43,
    alignItems: 'center',
    borderRadius: 12,
  },
  rowContainer: {
    height: 20,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  ball: {
    width: 9,
    height: 9,
    borderRadius: 50,
    alignSelf: 'center',
  },
  resultText: {
    fontSize: 14,
    fontWeight: 'medium',
  },
})

export const SearchPlace = memo(LocationSearch)
