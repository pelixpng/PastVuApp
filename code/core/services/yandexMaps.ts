import { getApiKey } from '../../modules/app-keys'
import { YamapUtils } from '@exterio/react-native-yamap-lite'

/**
 * Yandex MapKit needs its key before the first map mounts, and the SDK is loaded lazily by the
 * native module, so this runs once at app start. Without a key the option is not offered at all.
 */
const API_KEY: string = getApiKey('YANDEX_MAPS_API_KEY')

export const isYandexConfigured = () => API_KEY.length > 0

let pending: Promise<void> | null = null

/**
 * Resolves once MapKit has its key. Shared, so the app start and the first map mount both wait on
 * the same call; a failed attempt is dropped so the next mount retries.
 */
export const initYandexMaps = (): Promise<void> => {
	if (!isYandexConfigured()) return Promise.resolve()
	if (!pending) {
		pending = YamapUtils.init(API_KEY).catch(error => {
			pending = null
			console.error('YamapUtils.init failed', error)
			throw error
		})
	}
	return pending
}
