import { MapMarker } from '../types/apiPhotoList'

/** Stable identity of a marker: the photo id, or the cluster's position. */
export const markerKey = (marker: MapMarker): string =>
	marker._type === 'photo'
		? `photo-${marker.cid}`
		: `cluster-${marker.location.latitude},${marker.location.longitude}`

/**
 * Drops repeated markers, keeping the first occurrence.
 *
 * The API can return the same photo twice in one response, and merged responses can overlap; the
 * markers are rendered with their key as the React key, so a repeat is a duplicate-key error on
 * the map (Fabric-based Yandex map reports it, react-native-maps only silently drops it).
 */
export const dedupeMarkers = (markers: MapMarker[]): MapMarker[] => {
	const seen = new Set<string>()
	return markers.filter(marker => {
		const key = markerKey(marker)
		if (seen.has(key)) return false
		seen.add(key)
		return true
	})
}
