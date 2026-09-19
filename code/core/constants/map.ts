import { Region } from 'react-native-maps'
import { getLocales } from 'expo-localization'
import LocaleStore from '../store/Locale.store'

type Point = [latitude: number, longitude: number]

/** A city centre with a street-level span: the first screen should have photos on it, not a country. */
const region = ([latitude, longitude]: Point): Region => ({
	latitude,
	longitude,
	latitudeDelta: 0.01,
	longitudeDelta: 0.01
})

/**
 * Where the map opens on a first launch, by the device's country (ISO 3166-1 alpha-2).
 *
 * Mostly capitals, with a few deliberate exceptions where PastVu's archive is much richer in
 * another city: New York over Washington, Istanbul over Ankara, Almaty over Astana, Rio over
 * Brasília, Sydney over Canberra.
 */
const CITY_BY_COUNTRY: Record<string, Point> = {
	// Eastern Europe and the former USSR
	RU: [55.763307, 37.576945], // Moscow
	UA: [50.450001, 30.523333], // Kyiv
	BY: [53.902496, 27.561481], // Minsk
	MD: [47.010452, 28.86381], // Chișinău
	KZ: [43.238949, 76.889709], // Almaty
	UZ: [41.311081, 69.240562], // Tashkent
	KG: [42.874621, 74.569762], // Bishkek
	TJ: [38.559772, 68.787038], // Dushanbe
	TM: [37.960077, 58.326063], // Ashgabat
	GE: [41.715138, 44.827096], // Tbilisi
	AM: [40.187419, 44.515209], // Yerevan
	AZ: [40.409264, 49.867092], // Baku
	// Baltics and the Nordics
	EE: [59.436962, 24.753574], // Tallinn
	LV: [56.949649, 24.105186], // Riga
	LT: [54.687157, 25.279652], // Vilnius
	FI: [60.169857, 24.938379], // Helsinki
	SE: [59.329323, 18.068581], // Stockholm
	NO: [59.913869, 10.752245], // Oslo
	DK: [55.676098, 12.568337], // Copenhagen
	IS: [64.146582, -21.942635], // Reykjavík
	// Central Europe
	PL: [52.229676, 21.012229], // Warsaw
	DE: [52.520008, 13.404954], // Berlin
	CZ: [50.075539, 14.4378], // Prague
	SK: [48.148598, 17.107748], // Bratislava
	HU: [47.497913, 19.040236], // Budapest
	AT: [48.208174, 16.373819], // Vienna
	CH: [47.376887, 8.541694], // Zürich
	// The Balkans and South-Eastern Europe
	RS: [44.786568, 20.448922], // Belgrade
	HR: [45.815399, 15.966568], // Zagreb
	SI: [46.056947, 14.505751], // Ljubljana
	BA: [43.856259, 18.413076], // Sarajevo
	ME: [42.430421, 19.259364], // Podgorica
	MK: [41.997346, 21.427996], // Skopje
	AL: [41.327546, 19.818698], // Tirana
	RO: [44.426767, 26.102538], // Bucharest
	BG: [42.697708, 23.321868], // Sofia
	GR: [37.983917, 23.72936], // Athens
	TR: [41.008238, 28.978359], // Istanbul
	CY: [35.185566, 33.382276], // Nicosia
	// Western and Southern Europe
	FR: [48.856614, 2.352222], // Paris
	BE: [50.850346, 4.351721], // Brussels
	NL: [52.370216, 4.895168], // Amsterdam
	LU: [49.611621, 6.131935], // Luxembourg
	GB: [51.507351, -0.127758], // London
	IE: [53.349805, -6.26031], // Dublin
	IT: [41.902783, 12.496366], // Rome
	ES: [40.416775, -3.70379], // Madrid
	PT: [38.722252, -9.139337], // Lisbon
	// The Americas
	US: [40.712776, -74.005974], // New York
	CA: [45.501689, -73.567256], // Montreal
	MX: [19.432608, -99.133209], // Mexico City
	BR: [-22.906847, -43.172896], // Rio de Janeiro
	AR: [-34.603684, -58.381559], // Buenos Aires
	// The Middle East, Asia, Africa, Oceania
	IL: [31.768319, 35.21371], // Jerusalem
	EG: [30.04442, 31.235712], // Cairo
	IN: [28.613939, 77.209021], // New Delhi
	CN: [39.904202, 116.407394], // Beijing
	JP: [35.689487, 139.691711], // Tokyo
	KR: [37.566535, 126.977969], // Seoul
	AU: [-33.86882, 151.20929], // Sydney
	NZ: [-41.28646, 174.776236], // Wellington
	ZA: [-33.924869, 18.424055] // Cape Town
}

/** Fallback by interface language when the device does not say which country it is in. */
const CITY_BY_LANGUAGE: Record<string, Point> = {
	ru: CITY_BY_COUNTRY.RU,
	uk: CITY_BY_COUNTRY.UA,
	be: CITY_BY_COUNTRY.BY,
	pl: CITY_BY_COUNTRY.PL,
	de: CITY_BY_COUNTRY.DE,
	cs: CITY_BY_COUNTRY.CZ,
	hu: CITY_BY_COUNTRY.HU,
	fi: CITY_BY_COUNTRY.FI,
	et: CITY_BY_COUNTRY.EE,
	lv: CITY_BY_COUNTRY.LV,
	lt: CITY_BY_COUNTRY.LT,
	sr: CITY_BY_COUNTRY.RS,
	fr: CITY_BY_COUNTRY.FR
}

/** Densest PastVu coverage outside Russia; the last resort when nothing else is known. */
const FALLBACK = CITY_BY_COUNTRY.HU

/**
 * Where the map opens on a first launch, before the user has panned it anywhere.
 *
 * The device's region setting comes first: it says where the user actually is far better than
 * the interface language does (an English-speaking phone in Warsaw should open on Warsaw). The
 * language is only consulted when the region is unknown, and Budapest closes the list.
 */
export const defaultRegion = (): Region => {
	const country = getLocales()[0]?.regionCode?.toUpperCase()
	const point =
		(country ? CITY_BY_COUNTRY[country] : undefined) ??
		CITY_BY_LANGUAGE[LocaleStore.locale] ??
		FALLBACK
	return region(point)
}
