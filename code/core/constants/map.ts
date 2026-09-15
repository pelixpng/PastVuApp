import { Region } from 'react-native-maps'
import LocaleStore from '../store/Locale.store'

const MOSCOW: Region = {
  latitude: 55.763307,
  longitude: 37.576945,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
}

const BUDAPEST: Region = {
  latitude: 47.497913,
  longitude: 19.040236,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
}

/**
 * Where the map opens on a first launch, before the user has panned it anywhere.
 *
 * Russian speakers land in Moscow, everyone else in Budapest — PastVu's coverage outside Russia is
 * densest there, so the first screen has photos on it either way.
 */
export const defaultRegion = (): Region => (LocaleStore.locale === 'ru' ? MOSCOW : BUDAPEST)
