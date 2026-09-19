import { Platform } from 'react-native'
import { OptionsRadioButton } from '../components/ui/buttons/radioButton/RadioButtons'
import { t } from '../i18n'

const showClusterOptions = (): OptionsRadioButton[] => [
	{ label: t('common.yes'), value: 'yes' },
	{ label: t('common.no'), value: 'no' }
]
const themeOptions = (): OptionsRadioButton[] => [
	{ label: t('options.themeDark'), value: 'dark' },
	{ label: t('options.themeLight'), value: 'light' },
	{ label: t('options.themeSystem'), value: 'system' }
]
const photoQualityOptions = (): OptionsRadioButton[] => [
	{ label: t('options.qualityOriginal'), value: 'a' },
	{ label: t('options.qualityStandard'), value: 'd' },
	{ label: t('options.qualityThumbnail'), value: 'h' }
]
const mapTypeOptions = (): OptionsRadioButton[] => [
	{ label: t('options.mapStandard'), value: 'standard' },
	{ label: t('options.mapSatellite'), value: 'satellite' },
	{ label: t('options.mapHybrid'), value: 'hybrid' },
	{ label: t('options.mapTerrain'), value: 'terrain' }
]
const markerTypeOptions = (): OptionsRadioButton[] => [
	{ label: t('options.markerNew'), value: 'new' },
	{ label: t('options.markerOld'), value: 'old' }
]
const mapProviderOptions = (): OptionsRadioButton[] => [
	{
		label: Platform.OS === 'ios' ? 'Apple Maps' : 'Google Maps',
		value: Platform.OS === 'ios' ? 'apple' : 'google'
	},
	{ label: t('options.mapYandex'), value: 'yandex' }
]
const languageOptions = (): OptionsRadioButton[] => [
	// Language names stay in their own language; only the system option is translated.
	{ label: t('options.languageSystem'), value: 'system' },
	{ label: 'Беларуская', value: 'be' },
	{ label: 'Čeština', value: 'cs' },
	{ label: 'Deutsch', value: 'de' },
	{ label: 'Eesti', value: 'et' },
	{ label: 'English', value: 'en' },
	{ label: 'Français', value: 'fr' },
	{ label: 'Latviešu', value: 'lv' },
	{ label: 'Lietuvių', value: 'lt' },
	{ label: 'Magyar', value: 'hu' },
	{ label: 'Polski', value: 'pl' },
	{ label: 'Русский', value: 'ru' },
	{ label: 'Српски', value: 'sr' },
	{ label: 'Suomi', value: 'fi' },
	{ label: 'Українська', value: 'uk' }
]
export const SettingsOptions = {
	languageOptions,
	mapProviderOptions,
	showClusterOptions,
	themeOptions,
	photoQualityOptions,
	mapTypeOptions,
	markerTypeOptions
}
