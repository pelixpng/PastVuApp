import { FC, useState } from 'react'
import {
  ActivityIndicator,
  View,
  FlatList,
  TouchableOpacity,
  Text,
  TextInput,
  StyleSheet,
} from 'react-native'
import { MaterialIcons } from '../ui/icons'
import { useTheme } from '@react-navigation/native'
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context'
import { ScreenRect, cameraBesideTop, topLevelWith } from '../../utils/sideCamera'
import { Spacer } from '../ui/Spacer'
import { t } from '../../i18n'
import { observer } from 'mobx-react-lite'
import {
  MIN_QUERY,
  normalizePlaceQuery,
  PlaceSearch,
  PlaceSearchStatus,
} from '../../store/PlaceSearch'

type SearchPlaceProps = {
  search: PlaceSearch
  goToLocation: (latitude: number, longitude: number) => void
  /**
   * The tablet's left column, which the field and its results stand in: `left` from the screen's
   * left edge and `width`. Without it, the phone's whole width less 16 pt each side.
   */
  column?: { left: number; width: number }
  /** Called when the field takes focus, e.g. to move something out of the way of the results. */
  onFocus?: () => void
  /**
   * Where the field stands beside a camera (see searchFieldBesideCamera): its top, and on the phone
   * its padding. In the tablet's column only the top counts.
   */
  besideCamera?: SearchFieldBesideCamera | null
}

/** Height of the search field, which sits at the top safe-area inset. */
export const SEARCH_FIELD_HEIGHT = 43

/** Between the search field and a camera beside it, as between the field and the screen's edge. */
const CAMERA_GAP = 16

export type SearchFieldBesideCamera = {
  top: number
  paddingLeft?: number
  paddingRight?: number
}

/**
 * Where the phone's search field stands when a camera is beside the top of the screen rather than
 * above it: level with the camera, centred on it, and ending before it. iPhone Duo's cover display
 * has its camera in the top-right corner and a top safe-area inset of 0, so at the inset the field
 * would run under the camera. Null where a camera sits within the top inset, as on other iPhones.
 *
 * `regions` are what the hardware covers of the screen (see modules/window-region
 * ReservedRegionsView), `insets` the safe-area insets and `width` the screen's.
 */
export const searchFieldBesideCamera = (
  regions: ScreenRect[],
  insets: EdgeInsets,
  width: number,
): SearchFieldBesideCamera | null => {
  const camera = cameraBesideTop(regions, insets, width, SEARCH_FIELD_HEIGHT)
  if (!camera) return null
  const fieldTop = topLevelWith(camera, SEARCH_FIELD_HEIGHT, insets.top)
  return camera.x + camera.width / 2 > width / 2
    ? { top: fieldTop, paddingRight: width - camera.x + CAMERA_GAP }
    : { top: fieldTop, paddingLeft: camera.x + camera.width + CAMERA_GAP }
}

/**
 * The line that stands in for the list when a search brings back no places, or null when the list
 * itself is shown. Called while rendering, so it follows a change of language.
 */
const statusText = (status: PlaceSearchStatus): string | null => {
  switch (status) {
    case 'empty':
      return t('map.searchEmpty')
    case 'busy':
      return t('map.searchBusy')
    case 'dayLimit':
      return t('map.searchDayLimit')
    case 'error':
      return t('map.searchError')
    default:
      return null
  }
}

/** A search that ended without an answer, as opposed to one that found nothing. */
const failed = (status: PlaceSearchStatus) =>
  status === 'busy' || status === 'dayLimit' || status === 'error'

const LocationSearch: FC<SearchPlaceProps> = ({
  search,
  goToLocation,
  column,
  onFocus,
  besideCamera,
}) => {
  const [isFocused, setIsFocused] = useState(false)
  const { colors } = useTheme()
  const { top } = useSafeAreaInsets()
  const { query, places, status } = search
  // A shorter query is never sent, so there is nothing to report on it.
  const searching = isFocused && normalizePlaceQuery(query).length >= MIN_QUERY
  const message = searching ? statusText(status) : null
  return (
    <View
      style={[
        s.container,
        { top: besideCamera?.top ?? top },
        column
          ? { width: column.width, left: column.left, alignSelf: 'flex-start' }
          : {
              width: '100%',
              paddingLeft: besideCamera?.paddingLeft ?? 16,
              paddingRight: besideCamera?.paddingRight ?? 16,
            },
      ]}>
      <View style={[s.searchContainer, { backgroundColor: colors.backgroundApp }]}>
        <MaterialIcons name="search" size={25} color={colors.textThird} />
        <Spacer width={5} />
        <TextInput
          style={[s.input, { color: colors.textFirst }]}
          placeholder={t('map.searchPlaceholder')}
          placeholderTextColor={colors.textSecond}
          value={query}
          onChangeText={search.setQuery}
          onFocus={() => {
            setIsFocused(true)
            // A search that failed is tried again on coming back, e.g. once the connection is back.
            if (failed(search.status)) search.setQuery(search.query)
            onFocus?.()
          }}
          onBlur={() => setIsFocused(false)}
        />
        {searching && status === 'loading' && (
          <ActivityIndicator size="small" color={colors.textThird} style={s.spinner} />
        )}
        {query.length > 0 && (
          <MaterialIcons
            name="close"
            size={21}
            color={colors.textThird}
            onPress={() => search.setQuery('')}
          />
        )}
      </View>
      <Spacer height={8} />
      {message ? (
        <View style={[s.list, { backgroundColor: colors.backgroundApp }]}>
          <View style={s.messageRow}>
            <Text style={[s.messageText, { color: colors.textSecond }]}>{message}</Text>
          </View>
        </View>
      ) : (
        searching &&
        places.length > 0 && (
          <FlatList
            data={places}
            scrollEnabled={false}
            keyboardShouldPersistTaps={'always'}
            keyExtractor={item => String(item.place_id)}
            contentContainerStyle={[s.list, { backgroundColor: colors.backgroundApp }]}
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
        )
      )}
    </View>
  )
}

const s = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 9,
  },
  // The rows fill the list edge to edge, so a tap anywhere on it lands on a place.
  list: {
    paddingVertical: 8,
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
    height: SEARCH_FIELD_HEIGHT,
    alignItems: 'center',
    borderRadius: 12,
  },
  spinner: {
    marginRight: 6,
  },
  // 34 pt rows with no gaps, so all of the list is tappable.
  rowContainer: {
    height: 34,
    paddingLeft: 20,
    paddingRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  // As tall as a result row for a short line; a longer one wraps rather than losing its ending,
  // which is the part that says what to do.
  messageRow: {
    minHeight: 34,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  ball: {
    width: 9,
    height: 9,
    borderRadius: 50,
    alignSelf: 'center',
  },
  // Shrinks to the row, so numberOfLines cuts a long name with an ellipsis instead of clipping it.
  resultText: {
    flex: 1,
    fontSize: 14,
    fontWeight: 'medium',
  },
  messageText: {
    fontSize: 14,
    fontWeight: 'medium',
  },
})

// `observer` rather than `memo`: it still skips renders on equal props, and also re-renders when
// the language changes, which `t()` reads from the locale store.
export const SearchPlace = observer(LocationSearch)
