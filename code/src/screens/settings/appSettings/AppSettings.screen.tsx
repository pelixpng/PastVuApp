import { ScrollContainer } from '../../../components/ui/Containers'
import { SliderComponent } from './components/settingsSlider/SliderSettings'
import { Platform, View } from 'react-native'
import { UICard } from '../../../components/ui/UICards'
import { RadioButtons } from '../../../components/ui/buttons/radioButton/RadioButtons'
import { MenuDescriptionText, MenuTitleText } from '../../../components/ui/Texts'
import { useVM } from '../../../hooks/useVM'
import React from 'react'
import ApiStore from '../../../store/global/Api.store'
import MapStore from '../../../store/global/Map.store'
import { observer } from 'mobx-react'
import ThemeStore from '../../../store/global/Theme.store'
import AppSettingsVM from './AppSettings.vm'

export const AppSettingsScreen = observer(() => {
  const vm = useVM(AppSettingsVM)
  return (
    <ScrollContainer>
      <UICard>
        <View>
          <MenuTitleText>Параметры карты</MenuTitleText>
          <MenuDescriptionText>
            Сгруппировать фото на карте (как на веб версии) ?
          </MenuDescriptionText>
        </View>
        <RadioButtons
          options={vm.showClusterOptions}
          selectedValue={ApiStore.showCluster}
          setValue={ApiStore.setShowCluster}
        />
        {ApiStore.showCluster === 'no' && (
          <>
            <MenuDescriptionText>
              Настройка расстояния поиска фотографий от текущих координат, количества запрашиваемых
              фотографий при изменении координат, максимального количество фотографий на карте.
            </MenuDescriptionText>
            <SliderComponent
              title="Максимальное расстояние в метрах"
              maxValue={10000}
              minValue={0}
              value={ApiStore.maxDistance}
              setValue={ApiStore.setMaxDistancePhoto}
            />
            <SliderComponent
              value={ApiStore.requestCountPhoto}
              setValue={ApiStore.setRequestCountPhoto}
              title={'Количество запрашиваемых фото '}
              minValue={0}
              maxValue={30}
            />
            <SliderComponent
              value={MapStore.maxPhotoOnMap}
              setValue={MapStore.setMaxPhotoMap}
              title={'Количество фото на карте'}
              minValue={0}
              maxValue={800}
            />
          </>
        )}
      </UICard>
      <UICard>
        <View>
          <MenuTitleText>Тема</MenuTitleText>
          <MenuDescriptionText>Цветовая схема приложения.</MenuDescriptionText>
        </View>
        <RadioButtons
          options={vm.themeOptions}
          selectedValue={ThemeStore.selectedTheme}
          setValue={ThemeStore.setTheme}
        />
      </UICard>
      <UICard>
        <View>
          <MenuTitleText>Фото</MenuTitleText>
          <MenuDescriptionText>
            Качество загружаемых фотографий, при плохом интернет соединении рекомендуется понизить
            качество до миниатюры.
          </MenuDescriptionText>
        </View>
        <RadioButtons
          options={vm.photoQualityOptions}
          selectedValue={ApiStore.photoQualitySettings}
          setValue={ApiStore.setPhotoQuality}
        />
      </UICard>
      <UICard>
        <View>
          <MenuTitleText>Тип карты</MenuTitleText>
          <MenuDescriptionText>Выбор слоя карты.</MenuDescriptionText>
        </View>
        <RadioButtons
          options={vm.mapTypeOptions}
          selectedValue={MapStore.mapType}
          setValue={MapStore.setMapType}
        />
      </UICard>
      {Platform.OS === 'android' && (
        <UICard>
          <View>
            <MenuTitleText>Тип маркера</MenuTitleText>
            <MenuDescriptionText>Выбор типа маркера на Google Maps.</MenuDescriptionText>
          </View>
          <RadioButtons
            options={vm.markerTypeOptions}
            selectedValue={MapStore.markerType}
            setValue={MapStore.setMarkerType}
          />
        </UICard>
      )}
    </ScrollContainer>
  )
})
