import React, { FC } from 'react'
import { ScrollContainer } from '../../components/ui/UniversalComponents'
import { InsideMenuComponent } from '../../components/ui/InsideMenuComponent'
import { SliderComponent } from '../../components/sliders/SliderComponen'
import { InsideMenuProps } from '../../types/components'
import { observer } from 'mobx-react-lite'
import { RadioButtonComponent } from '../../components/buttons/RadioButtonComponent'
import SettingsMapStore from '../../mobx/SettingsMapStore'

const InsideMenuText: InsideMenuProps[] = [
	{
		title: 'Параметры карты',
		discription:
			'Настройка маскиммального растояния поиска фотографий от текущих координат и количество загружаемых фотографий.'
	},
	{
		title: 'Тема',
		discription: 'Настройка цветовой схемы приложения'
	}
]

export const MapSettings: FC = observer(() => {
	const { countPhoto, changeCountPhoto, maxDistance, changeDistancePhoto } =
		SettingsMapStore

	return (
		<ScrollContainer>
			<InsideMenuComponent
				title={InsideMenuText[0].title}
				discription={InsideMenuText[0].discription}
				CustomComponent={
					<SliderComponent
						title="Максимальное растояние в метрах"
						maxValue={10000}
						minValue={0}
						value={maxDistance}
						setValue={changeDistancePhoto}
					/>
				}
				CustomComponent2={
					<SliderComponent
						value={countPhoto}
						setValue={changeCountPhoto}
						title={'Максимальное количество фото'}
						minValue={0}
						maxValue={30}
					/>
				}
			/>
			<InsideMenuComponent
				title={InsideMenuText[1].title}
				discription={InsideMenuText[1].discription}
				CustomComponent={<RadioButtonComponent />}
			/>
		</ScrollContainer>
	)
})
