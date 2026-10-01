import { SliderComponent } from './components/settingsSlider/SliderSettings'
import { Platform } from 'react-native'
import { RadioButtons } from '../../../../core/components/ui/buttons/radioButton/RadioButtons'
import { observer } from 'mobx-react-lite'
import AppSettingsVM from './AppSettings.vm'
import { Container } from '../../../../core/components/ui/Container'
import { UICard } from '../../../../core/components/ui/UICards'
import { Text, StyleSheet } from 'react-native'
import { useTheme } from '@react-navigation/native'
import { Spacer } from '../../../../core/components/ui/Spacer'
import { useVM } from '../../../../core/hooks/useVM'
import ApiStore from '../../../../core/store/Api.store'
import MapStore from '../../../../core/store/Map.store'
import ThemeStore from '../../../../core/store/Theme.store'
import { t } from '../../../../core/i18n'
import LocaleStore from '../../../../core/store/Locale.store'
import { SettingsOptions } from '../../../../core/constants/settings'
import { isYandexConfigured } from '../../../../core/services/yandexMaps'

export const AppSettingsScreen = observer(() => {
	const vm = useVM(AppSettingsVM)
	const { colors } = useTheme()

	return (
		<Container isScroll pdHorizontal={16}>
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
					options={vm.showClusterOptions()}
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
					options={vm.themeOptions()}
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
					options={vm.photoQualityOptions()}
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
						<RadioButtons
							options={vm.mapProviderOptions()}
							selectedValue={MapStore.mapProvider}
							setValue={MapStore.setMapProvider}
						/>
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
							options={vm.mapTypeOptions()}
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
							options={vm.markerTypeOptions()}
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
		</Container>
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
