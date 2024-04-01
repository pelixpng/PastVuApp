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
import { Platform } from 'react-native'

const InsideMenuText: InsideMenuProps[] = [
  {
    title: 'Параметры карты',
    description:
      'Настройка расстояния поиска фотографий от текущих координат, количества запрашиваемых фотографий при изменении координат, максимального количество фотографий на карте.',
  },
  {
    title: 'Тема',
    description: 'Цветовая схема приложения.',
  },
  {
    title: 'Фото',
    description:
      'Качество загружаемых фотографий, при плохом интернет соединении рекомендуется понизить качество до миниатюры.',
  },
  {
    title: 'Тип карты',
    description: 'Выбор карты',
  },
  {
    title: 'Тип маркера',
    description: 'Выбор типа маркера на карте.',
  },
]

export const MapSettings: FC = observer(() => {
  const {
    countPhoto,
    changeCountPhoto,
    maxDistance,
    changeDistancePhoto,
    changeMaxPhotoMap,
    maxPhotoOnMap,
    mapTypeTitle,
    changeMapType,
    changeMarkerType,
    markerType,
  } = SettingsMapStore
  const { changePhotoQuality, photoQualityTitle } = SettingsPhotoStore
  const { themeSettingsTitle, changeSettingsThemeTitle } = ThemeStore
  const themeTitles = ['Тёмная', 'Светлая', 'Системная']
  const PhotoSettingsTitles = ['Оригинал', 'Стандарт', 'Миниатюра']
  const mapTypeTitles = ['Стандарт', 'Спутник', 'Гибрид', 'Рельеф']
  const markerTypeTitles = ['Новый', 'Старый']
  return (
    <ScrollContainer>
      <InsideMenuComponent
        title={InsideMenuText[0].title}
        description={InsideMenuText[0].description}>
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
        description={InsideMenuText[1].description}>
        <RadioButtons
          titles={themeTitles}
          value={themeSettingsTitle}
          setValue={changeSettingsThemeTitle}
        />
      </InsideMenuComponent>
      <InsideMenuComponent
        title={InsideMenuText[2].title}
        description={InsideMenuText[2].description}>
        <RadioButtons
          titles={PhotoSettingsTitles}
          value={photoQualityTitle}
          setValue={changePhotoQuality}
        />
      </InsideMenuComponent>
      <InsideMenuComponent
        title={InsideMenuText[3].title}
        description={InsideMenuText[3].description}>
        <RadioButtons titles={mapTypeTitles} value={mapTypeTitle} setValue={changeMapType} />
      </InsideMenuComponent>
      {Platform.OS === 'android' && (
        <InsideMenuComponent
          title={InsideMenuText[4].title}
          description={InsideMenuText[4].description}>
          <RadioButtons titles={markerTypeTitles} value={markerType} setValue={changeMarkerType} />
        </InsideMenuComponent>
      )}
    </ScrollContainer>
  )
})
