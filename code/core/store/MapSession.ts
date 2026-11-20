import { NearbySearch } from './NearbySearch'
import { PhotoMap } from './PhotoMap'

/**
 * The one photo map of the app and its nearby-photos sheet, shared by the phone's and the tablet's
 * map screens. On iPhone Duo the interface changes between the two as the device folds and
 * unfolds, and a map of each screen's own would lose the markers, the place search and the open
 * sheet every time. It would also keep running: PhotoMap's reactions follow the API and map
 * settings, so a map left behind by an interface that is gone would keep asking for markers.
 */
class MapSession {
	/** The map's area, years and markers, the place search and the camera. */
	readonly map = new PhotoMap()
	/** The nearby-photos sheet; it follows the map's centre and years while open. */
	readonly nearby = new NearbySearch(
		() => this.map.coordinates,
		() => this.map.yearsRange
	)
}

let session: MapSession | null = null

/** Created by the first map screen, not at import, so the markers wait for one to need them. */
export const mapSession = () => (session ??= new MapSession())
