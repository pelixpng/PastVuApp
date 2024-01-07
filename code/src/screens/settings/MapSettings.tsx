import React, { FC } from 'react'
import { ScrollContainer } from '../../components/ui/UniversalComponents'
import { InsideMenuComponent } from '../../components/ui/InsideMenuComponent'
import { SliderComponent } from '../../components/sliders/SliderComponen'
import { InsideMenuProps } from '../../types/components'
import { observer } from 'mobx-react-lite'
import { RadioButtons } from '../../components/buttons/radioButton/RadioButtons'
import SettingsMapStore from '../../mobx/SettingsMapStore'
import SettingsPhotoStore from '../../mobx/PhotoSettingsStore'
import ThemeStore from '../../mobx/ThemeStore'

const InsideMenuText: InsideMenuProps[] = [
	{
		title: 'Параметры карты',
		description:
			'Настройка расстояния поиска фотографий от текущих координат, количества запрашиваемых фотографий при изменении координат, максимального количество фотографий на карте.'
	},
	{
		title: 'Тема',
		description: 'Настройка цветовой схемы приложения.'
	},
	{
		title: 'Фото',
		description:
			'Настройка качества загружаемых фотографий, при плохом интернет соединении рекомендуется понизить качество до миниатюры.'
	}
]

export const MapSettings: FC = observer(() => {
	const {
		countPhoto,
		changeCountPhoto,
		maxDistance,
		changeDistancePhoto,
		changeMaxPhotoMap,
		maxPhotoOnMap
	} = SettingsMapStore
	const { changePhotoQuality, photoQuality } = SettingsPhotoStore
	const { changeThemeSettings, themeSettings } = ThemeStore
	const themeTitles = ['Тёмная', 'Светлая', 'Системная']
	const PhotoSettingsTitles = ['Оригинал', 'Стандарт', 'Миниатюра']
	return (
		<ScrollContainer>
			<InsideMenuComponent
				title={InsideMenuText[0].title}
				description={InsideMenuText[0].description}
			>
				<SliderComponent
					title="Максимальное расстояние в метрах"
					maxValue={10000}
					minValue={0}
					value={maxDistance}
					setValue={changeDistancePhoto}
				/>
				<SliderComponent
					value={countPhoto}
					setValue={changeCountPhoto}
					title={'Количество запрашиваемых фото '}
					minValue={0}
					maxValue={30}
				/>
				<SliderComponent
					value={maxPhotoOnMap}
					setValue={changeMaxPhotoMap}
					title={'Максимальное количество фото на карте'}
					minValue={0}
					maxValue={800}
				/>
			</InsideMenuComponent>
			<InsideMenuComponent
				title={InsideMenuText[1].title}
				description={InsideMenuText[1].description}
			>
				<RadioButtons
					titles={themeTitles}
					value={themeSettings}
					setValue={changeThemeSettings}
				/>
			</InsideMenuComponent>
			<InsideMenuComponent
				title={InsideMenuText[2].title}
				description={InsideMenuText[2].description}
			>
				<RadioButtons
					titles={PhotoSettingsTitles}
					value={photoQuality}
					setValue={changePhotoQuality}
				/>
			</InsideMenuComponent>
		</ScrollContainer>
	)
})
