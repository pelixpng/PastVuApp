import { FC } from 'react'
import { Text, StyleSheet, Platform } from 'react-native'
import { useTheme } from '@react-navigation/native'
import { observer } from 'mobx-react-lite'
import { RadioButtons } from '../ui/buttons/radioButton/RadioButtons'
import { UICard } from '../ui/UICards'
import { Spacer } from '../ui/Spacer'
import { SliderComponent } from './settingsSlider/SliderSettings'
import { MapProviderRadio } from './MapProviderRadio'
import { ColorizerModelCard } from '../colorize/ColorizerModelCard'
import ApiStore from '../../store/Api.store'
import MapStore from '../../store/Map.store'
import ThemeStore from '../../store/Theme.store'
import LocaleStore from '../../store/Locale.store'
import ColorizeStore from '../../store/Colorize.store'
import TranslationStore from '../../store/Translation.store'
import { SettingsOptions } from '../../constants/settings'
import { isYandexConfigured } from '../../services/yandexMaps'
import { TRANSLATION_AVAILABLE } from '../../services/translate'
import { t } from '../../i18n'

/**
 * The cards of the app settings, the same on a phone and a tablet. The screen around them supplies
 * the scrolling container and its side margins.
 */
export const AppSettingsContent: FC = observer(() => {
	const { colors } = useTheme()
	return (
		<>
			<Spacer height={18} />
			<UICard>
				<Text style={[s.titleText, { color: colors.textFirst }]}>
					{t('appSettings.mapSection')}
				</Text>
				<Spacer height={4} />
				<Text style={[s.descriptionText, { color: colors.textSecond }]}>
					{t('appSettings.clusterQuestion')}
				</Text>
				<Spacer height={12} />
				<RadioButtons
					options={SettingsOptions.yesNoOptions()}
					selectedValue={ApiStore.showCluster}
					setValue={ApiStore.setShowCluster}
				/>
				<Spacer height={12} />
				{ApiStore.showCluster === 'no' && (
					<>
						<Text style={[s.descriptionText, { color: colors.textSecond }]}>
							{t('appSettings.searchHint')}
						</Text>
						<Spacer height={12} />
						<SliderComponent
							title={t('appSettings.maxDistance')}
							maxValue={10000}
							minValue={0}
							value={ApiStore.maxDistance}
							setValue={ApiStore.setMaxDistancePhoto}
						/>
						<Spacer height={12} />
						<SliderComponent
							value={ApiStore.requestCountPhoto}
							setValue={ApiStore.setRequestCountPhoto}
							title={t('appSettings.requestCount')}
							minValue={0}
							maxValue={30}
						/>
						<Spacer height={12} />
						<SliderComponent
							value={MapStore.maxPhotoOnMap}
							setValue={MapStore.setMaxPhotoMap}
							title={t('appSettings.maxOnMap')}
							minValue={0}
							maxValue={800}
						/>
					</>
				)}
			</UICard>
			<Spacer height={16} />
			<UICard>
				<Text style={[s.titleText, { color: colors.textFirst }]}>
					{t('appSettings.themeSection')}
				</Text>
				<Spacer height={4} />
				<Text style={[s.descriptionText, { color: colors.textSecond }]}>
					{t('appSettings.themeHint')}
				</Text>
				<Spacer height={12} />
				<RadioButtons
					options={SettingsOptions.themeOptions()}
					selectedValue={ThemeStore.selectedTheme}
					setValue={ThemeStore.setTheme}
				/>
			</UICard>
			<Spacer height={16} />
			<UICard>
				<Text style={[s.titleText, { color: colors.textFirst }]}>
					{t('appSettings.photoSection')}
				</Text>
				<Spacer height={4} />
				<Text style={[s.descriptionText, { color: colors.textSecond }]}>
					{t('appSettings.photoHint')}
				</Text>
				<Spacer height={12} />
				<RadioButtons
					options={SettingsOptions.photoQualityOptions()}
					selectedValue={ApiStore.photoQualitySettings}
					setValue={ApiStore.setPhotoQuality}
				/>
			</UICard>
			<Spacer height={16} />
			{isYandexConfigured() && (
				<>
					<UICard>
						<Text style={[s.titleText, { color: colors.textFirst }]}>
							{t('appSettings.mapProviderSection')}
						</Text>
						<Spacer height={4} />
						<Text style={[s.descriptionText, { color: colors.textSecond }]}>
							{t('appSettings.mapProviderHint')}
						</Text>
						<Spacer height={12} />
						{/* Asks for consent the first time Yandex Maps is chosen. */}
						<MapProviderRadio options={SettingsOptions.mapProviderOptions()} />
					</UICard>
					<Spacer height={16} />
				</>
			)}
			{/* Layers and marker styles belong to Google/Apple maps; Yandex draws its own. */}
			{MapStore.mapProvider !== 'yandex' && (
				<>
					<UICard>
						<Text style={[s.titleText, { color: colors.textFirst }]}>
							{t('appSettings.mapTypeSection')}
						</Text>
						<Spacer height={4} />
						<Text style={[s.descriptionText, { color: colors.textSecond }]}>
							{t('appSettings.mapTypeHint')}
						</Text>
						<Spacer height={12} />
						<RadioButtons
							options={SettingsOptions.mapTypeOptions()}
							selectedValue={MapStore.mapType}
							setValue={MapStore.setMapType}
						/>
					</UICard>
					<Spacer height={16} />
				</>
			)}
			{Platform.OS === 'android' && MapStore.mapProvider !== 'yandex' && (
				<>
					<UICard>
						<Text style={[s.titleText, { color: colors.textFirst }]}>
							{t('appSettings.markerSection')}
						</Text>
						<Spacer height={4} />
						<Text style={[s.descriptionText, { color: colors.textSecond }]}>
							{t('appSettings.markerHint')}
						</Text>
						<Spacer height={12} />
						<RadioButtons
							options={SettingsOptions.markerTypeOptions()}
							selectedValue={MapStore.markerType}
							setValue={MapStore.setMarkerType}
						/>
					</UICard>
					<Spacer height={16} />
				</>
			)}
			<UICard>
				<Text style={[s.titleText, { color: colors.textFirst }]}>
					{t('appSettings.languageSection')}
				</Text>
				<Spacer height={4} />
				<Text style={[s.descriptionText, { color: colors.textSecond }]}>
					{t('appSettings.languageHint')}
				</Text>
				<Spacer height={12} />
				<RadioButtons
					options={SettingsOptions.languageOptions()}
					selectedValue={LocaleStore.preference}
					setValue={LocaleStore.setLocale}
				/>
			</UICard>
			<Spacer height={16} />
			<UICard>
				<Text style={[s.titleText, { color: colors.textFirst }]}>
					{t('appSettings.aiWatermark')}
				</Text>
				<Spacer height={4} />
				<Text style={[s.descriptionText, { color: colors.textSecond }]}>
					{t('appSettings.aiWatermarkHint')}
				</Text>
				<Spacer height={12} />
				<RadioButtons
					options={SettingsOptions.yesNoOptions()}
					selectedValue={ColorizeStore.watermark ? 'yes' : 'no'}
					setValue={value => ColorizeStore.setWatermark(value === 'yes')}
				/>
			</UICard>
			<Spacer height={16} />
			{/* Only in a build with the translation key. */}
			{TRANSLATION_AVAILABLE && (
				<>
					<UICard>
						<Text style={[s.titleText, { color: colors.textFirst }]}>
							{t('appSettings.translation')}
						</Text>
						<Spacer height={4} />
						<Text style={[s.descriptionText, { color: colors.textSecond }]}>
							{t('appSettings.translationHint')}
						</Text>
						<Spacer height={12} />
						<RadioButtons
							options={SettingsOptions.yesNoOptions()}
							selectedValue={TranslationStore.enabled ? 'yes' : 'no'}
							setValue={value => TranslationStore.setEnabled(value === 'yes')}
						/>
					</UICard>
					<Spacer height={16} />
				</>
			)}
			{/* Only while the colorization model is downloaded: its size and a way to delete it. */}
			<ColorizerModelCard />
		</>
	)
})

const s = StyleSheet.create({
	descriptionText: {
		fontWeight: '400',
		fontSize: 13,
		lineHeight: 20
	},
	titleText: {
		fontSize: 15,
		lineHeight: 24,
		fontWeight: '800'
	}
})
