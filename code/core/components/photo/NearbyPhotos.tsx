import { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Image } from 'expo-image'
import { useTheme } from '@react-navigation/native'
import { observer } from 'mobx-react-lite'
import ApiService from '../../api/apiService'
import { NearbyPhoto } from '../../types/apiPhotoList'
import { Spacer } from '../ui/Spacer'
import { t } from '../../i18n'

type NearbyPhotosProps = {
  cid: string
  /** `[latitude, longitude]` of the photo; without it there is nothing to search around. */
  geo?: number[] | null
  onOpen: (cid: string) => void
  /** Side of a thumbnail. */
  size?: number
  /**
   * How far the caller's text column sits from the edge the row should run to. The row reaches
   * past the column by this much, and its first and last thumbnails line up with the text.
   */
  inset?: number
}

const GAP = 8
// Enough to fill the widest tablet panel; the row clips the rest on a phone.
const PLACEHOLDERS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

// Nothing to search around, or a point the server rejects: it fails on latitudes past ±90.
const validPoint = (geo: NearbyPhotosProps['geo']): geo is number[] =>
  Array.isArray(geo) &&
  geo.length >= 2 &&
  Number.isFinite(geo[0]) &&
  Number.isFinite(geo[1]) &&
  Math.abs(geo[0]) <= 90

const Gap = () => <Spacer width={GAP} />

/**
 * A row of the photos taken closest to this one, between the photo's details and its comments.
 * Shows placeholders while loading, so the comments below stay put when photos come back, and
 * nothing at all when the photo has no place on the map, nothing is near, or the request fails.
 */
export const NearbyPhotos: FC<NearbyPhotosProps> = observer(
  ({ cid, geo, onOpen, size = 88, inset = 0 }) => {
    const { colors } = useTheme()
    const hasPoint = validPoint(geo)
    const latitude = hasPoint ? geo[0] : undefined
    const longitude = hasPoint ? geo[1] : undefined
    // Results are tagged with what they were asked for, so an answer for the previous photo is
    // never shown under the next one, and a change of photo shows placeholders straight away.
    const requestKey = hasPoint ? `${cid}:${latitude},${longitude}` : null
    const [loaded, setLoaded] = useState<{ key: string; photos: NearbyPhoto[] } | null>(null)

    useEffect(() => {
      if (latitude === undefined || longitude === undefined) return
      const key = `${cid}:${latitude},${longitude}`
      let current = true
      ApiService.getNearbyPhotos(latitude, longitude, cid)
        .then(photos => current && setLoaded({ key, photos }))
        // A missing row is no loss on a photo page, so a failure just hides it.
        .catch(() => current && setLoaded({ key, photos: [] }))
      return () => {
        current = false
      }
    }, [cid, latitude, longitude])

    const thumbnail = useMemo(
      () => [s.thumbnail, { width: size, height: size, backgroundColor: colors.baseFifth }],
      [size, colors.baseFifth],
    )
    const bleed = { marginHorizontal: -inset }

    const renderItem = useCallback(
      ({ item }: { item: NearbyPhoto }) => (
        <TouchableOpacity
          onPress={() => onOpen(item.cid)}
          accessibilityRole="button"
          accessibilityLabel={`${item.title}, ${item.year}`}>
          <Image
            source={{ uri: `https://img.pastvu.com/h/${item.file}` }}
            style={thumbnail}
            cachePolicy="disk"
          />
        </TouchableOpacity>
      ),
      [onOpen, thumbnail],
    )

    if (!requestKey) return null
    const loading = loaded?.key !== requestKey
    if (!loading && !loaded.photos.length) return null

    return (
      <View style={s.container}>
        <Text style={[s.title, { color: colors.textFirst }]}>{t('photo.nearby')}</Text>
        <Spacer height={12} />
        {loading ? (
          <View style={[s.placeholderRow, bleed, { paddingHorizontal: inset }]}>
            {PLACEHOLDERS.map(index => (
              <View key={index} style={thumbnail} />
            ))}
          </View>
        ) : (
          <FlatList
            horizontal
            data={loaded.photos}
            renderItem={renderItem}
            keyExtractor={item => item.cid}
            ItemSeparatorComponent={Gap}
            showsHorizontalScrollIndicator={false}
            style={bleed}
            contentContainerStyle={{ paddingHorizontal: inset }}
          />
        )}
      </View>
    )
  },
)

const s = StyleSheet.create({
  // More than the 12 above the title: the thumbnails end on a hard edge, text on its leading.
  container: { marginBottom: 16 },
  // commentHeaderText from the phone and tablet postInfo/style.ts, so the two sections read as
  // equals; change them together.
  title: { fontSize: 17, fontWeight: '800', lineHeight: 28 },
  thumbnail: { borderRadius: 14 },
  placeholderRow: { flexDirection: 'row', gap: GAP, overflow: 'hidden' },
})
