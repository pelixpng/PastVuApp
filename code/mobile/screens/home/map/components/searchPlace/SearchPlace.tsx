import { FC, memo, useState } from 'react'
import { View, FlatList, TouchableOpacity, Text, TextInput } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { s } from './style'
import { useTheme } from '@react-navigation/native'
import { Spacer } from '../../../../../../core/components/ui/Spacer'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LocationItem } from '../../../../../../core/types/apiPhotoList'

type LocationSearchProps = {
  places: LocationItem[]
  query: string
  setQueryPlace: (query: string) => void
  goToLocation: (latitude: number, longitude: number) => void
}

const LocationSearch: FC<LocationSearchProps> = ({
  places,
  query,
  goToLocation,
  setQueryPlace,
}) => {
  const [isFocused, setIsFocused] = useState(false)
  const { colors } = useTheme()
  const { top } = useSafeAreaInsets()
  return (
    <View style={[s.container, { top }]}>
      <View style={[s.searchContainer, { backgroundColor: colors.backgroundApp }]}>
        <MaterialIcons name="search" size={24} color={colors.textThird} />
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
            size={20}
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

export const SearchPlace = memo(LocationSearch)
