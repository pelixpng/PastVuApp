import { FC } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useTheme } from '@react-navigation/native'
import { observer } from 'mobx-react-lite'
import { UICard } from '../../../../../core/components/ui/UICards'
import { Spacer } from '../../../../../core/components/ui/Spacer'
import { MaterialIcons } from '../../../../../core/components/ui/icons'
import { RadioButtons } from '../../../../../core/components/ui/buttons/radioButton/RadioButtons'
import TranslationStore from '../../../../../core/store/Translation.store'
import { SettingsOptions } from '../../../../../core/constants/settings'
import { t } from '../../../../../core/i18n'

/** Why the map is gone, in the left column where the search field stood. */
const MapHiddenCard: FC<{ title: string; text: string }> = ({ title, text }) => {
	const { colors } = useTheme()
	return (
		<UICard>
			<View style={[s.icon, { backgroundColor: colors.baseThird }]}>
				<MaterialIcons name="map" size={22} color={colors.textSecond} />
			</View>
			<Spacer height={12} />
			<Text style={[s.titleText, { color: colors.textFirst }]}>{title}</Text>
			<Spacer height={4} />
			<Text style={[s.descriptionText, { color: colors.textSecond }]}>{text}</Text>
		</UICard>
	)
}

/**
 * What stands where the Yandex map was while a translated post is open beside it: why the map is
 * gone, and the settings' translation switch, which, turned off, brings the map straight back.
 */
export const YandexTranslationNotice: FC = observer(() => {
	const { colors } = useTheme()
	return (
		<View style={s.column}>
			<MapHiddenCard title={t('map.yandexHiddenTitle')} text={t('map.yandexHiddenText')} />
			<Spacer height={16} />
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
		</View>
	)
})

/** What stands where an Apple or Yandex map was while then-and-now is open beside it. */
export const StreetViewNotice: FC = observer(() => (
	<View style={s.column}>
		<MapHiddenCard
			title={t('map.streetViewHiddenTitle')}
			text={t('map.streetViewHiddenText')}
		/>
	</View>
))

const s = StyleSheet.create({
	// From the top of the column, where the search field stood, level with the post's header.
	column: { flex: 1, justifyContent: 'flex-start' },
	icon: {
		width: 40,
		height: 40,
		borderRadius: 20,
		alignItems: 'center',
		justifyContent: 'center'
	},
	titleText: { fontSize: 15, lineHeight: 24, fontWeight: '800' },
	descriptionText: { fontWeight: '400', fontSize: 13, lineHeight: 20 }
})
