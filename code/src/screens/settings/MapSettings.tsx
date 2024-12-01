import { ScrollContainer } from '../../components/ui/Containers'
import { SliderComponent } from '../../components/sliders/settingsSlider/SliderSettings'
import { observer } from 'mobx-react-lite'
import SettingsMapStore from '../../mobx/SettingsMapStore'
import SettingsPhotoStore from '../../mobx/PhotoSettingsStore'
import ThemeStore from '../../mobx/ThemeStore'
import { Platform } from 'react-native'
import { UICardProps } from '../../types/components'
import { UICard } from '../../components/ui/UICards'
import { RadioButtons } from '../../components/ui/buttons/radioButton/RadioButtons'
import { MenuDescriptionText } from '../../components/ui/Texts'

const InsideMenuText: UICardProps[] = [
  {
    title: 'Параметры карты',
    description: 'Сгруппировать фото на карте (как на веб версии) ?',
    descriptionSecond:
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
    description: 'Выбор слоя карты.',
  },
  {
    title: 'Тип маркера',
    description: 'Выбор типа маркера на Google Maps.',
  },
  {
    title: 'Провайдер карты',
    description: 'Выбор поставщика карты.',
  },
]

export const MapSettings = observer(() => {
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
    showCluster,
    changeShowCluster,
    changeMapProvider,
    mapProvider,
  } = SettingsMapStore
  const { changePhotoQuality, photoQualityTitle } = SettingsPhotoStore
  const { themeSettingsTitle, changeSettingsThemeTitle } = ThemeStore
  const themeTitles = ['Тёмная', 'Светлая', 'Системная']
  const PhotoSettingsTitles = ['Оригинал', 'Стандарт', 'Миниатюра']
  const mapTypeTitles = ['Стандарт', 'Спутник', 'Гибрид', 'Рельеф']
  const markerTypeTitles = ['Новый', 'Старый']
  const showClusterTitles = ['Да', 'Нет']
  //const providerMapTitles = Platform.OS === 'android' ? ['Google'] : ['Apple', 'Google']
  return (
    <ScrollContainer>
      <UICard title={InsideMenuText[0].title} description={InsideMenuText[0].description}>
        <RadioButtons titles={showClusterTitles} value={showCluster} setValue={changeShowCluster} />
        {showCluster === 'Нет' && (
          <>
            <MenuDescriptionText>{InsideMenuText[0].descriptionSecond}</MenuDescriptionText>
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
              title={'Количество фото на карте'}
              minValue={0}
              maxValue={800}
            />
          </>
        )}
      </UICard>
      <UICard title={InsideMenuText[1].title} description={InsideMenuText[1].description}>
        <RadioButtons
          titles={themeTitles}
          value={themeSettingsTitle}
          setValue={changeSettingsThemeTitle}
        />
      </UICard>
      <UICard title={InsideMenuText[2].title} description={InsideMenuText[2].description}>
        <RadioButtons
          titles={PhotoSettingsTitles}
          value={photoQualityTitle}
          setValue={changePhotoQuality}
        />
      </UICard>
      <UICard title={InsideMenuText[3].title} description={InsideMenuText[3].description}>
        <RadioButtons titles={mapTypeTitles} value={mapTypeTitle} setValue={changeMapType} />
      </UICard>
      {Platform.OS === 'android' && (
        <UICard title={InsideMenuText[4].title} description={InsideMenuText[4].description}>
          <RadioButtons titles={markerTypeTitles} value={markerType} setValue={changeMarkerType} />
        </UICard>
      )}
      {/* <InsideMenuComponent
        title={InsideMenuText[5].title}
        description={InsideMenuText[5].description}>
        <RadioButtons titles={providerMapTitles} value={mapProvider} setValue={changeMapProvider} />
      </InsideMenuComponent> */}
    </ScrollContainer>
  )
})
