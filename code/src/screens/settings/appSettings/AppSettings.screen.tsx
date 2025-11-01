import { SliderComponent } from './components/settingsSlider/SliderSettings'
import { Platform } from 'react-native'
import { RadioButtons } from '../../../components/ui/buttons/radioButton/RadioButtons'
import { useVM } from '../../../hooks/useVM'
import ApiStore from '../../../store/global/Api.store'
import MapStore from '../../../store/global/Map.store'
import { observer } from 'mobx-react'
import ThemeStore from '../../../store/global/Theme.store'
import AppSettingsVM from './AppSettings.vm'
import { Container } from '../../../components/ui/Container'
import { UICard } from '../../../components/ui/UICards'
import { Text, StyleSheet } from 'react-native'
import { useTheme } from '@react-navigation/native'
import { Spacer } from '../../../components/ui/Spacer'

export const AppSettingsScreen = observer(() => {
  const vm = useVM(AppSettingsVM)
  const { colors } = useTheme()
  return (
    <Container isScroll>
      <Spacer height={18} />
      <UICard>
        <Text style={[s.titleText, { color: colors.textFirst }]}>Параметры карты</Text>
        <Spacer height={4} />
        <Text style={[s.descriptionText, { color: colors.textSecond }]}>
          Сгруппировать фото на карте (как на веб версии) ?
        </Text>
        <Spacer height={12} />
        <RadioButtons
          options={vm.showClusterOptions}
          selectedValue={ApiStore.showCluster}
          setValue={ApiStore.setShowCluster}
        />
        <Spacer height={12} />
        {ApiStore.showCluster === 'no' && (
          <>
            <Text style={[s.descriptionText, { color: colors.textSecond }]}>
              Настройка расстояния поиска фотографий от текущих координат, количества запрашиваемых
              фотографий при изменении координат, максимального количество фотографий на карте.
            </Text>
            <Spacer height={12} />
            <SliderComponent
              title="Максимальное расстояние в метрах"
              maxValue={10000}
              minValue={0}
              value={ApiStore.maxDistance}
              setValue={ApiStore.setMaxDistancePhoto}
            />
            <Spacer height={12} />
            <SliderComponent
              value={ApiStore.requestCountPhoto}
              setValue={ApiStore.setRequestCountPhoto}
              title={'Количество запрашиваемых фото '}
              minValue={0}
              maxValue={30}
            />
            <Spacer height={12} />
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
      <Spacer height={16} />
      <UICard>
        <Text style={[s.titleText, { color: colors.textFirst }]}>Тема</Text>
        <Spacer height={4} />
        <Text style={[s.descriptionText, { color: colors.textSecond }]}>
          Цветовая схема приложения.
        </Text>
        <Spacer height={12} />
        <RadioButtons
          options={vm.themeOptions}
          selectedValue={ThemeStore.selectedTheme}
          setValue={ThemeStore.setTheme}
        />
      </UICard>
      <Spacer height={16} />
      <UICard>
        <Text style={[s.titleText, { color: colors.textFirst }]}>Фото</Text>
        <Spacer height={4} />
        <Text style={[s.descriptionText, { color: colors.textSecond }]}>
          Качество загружаемых фотографий, при плохом интернет соединении рекомендуется понизить
          качество до миниатюры.
        </Text>
        <Spacer height={12} />
        <RadioButtons
          options={vm.photoQualityOptions}
          selectedValue={ApiStore.photoQualitySettings}
          setValue={ApiStore.setPhotoQuality}
        />
      </UICard>
      <Spacer height={16} />
      <UICard>
        <Text style={[s.titleText, { color: colors.textFirst }]}>Тип карты</Text>
        <Spacer height={4} />
        <Text style={[s.descriptionText, { color: colors.textSecond }]}>Выбор слоя карты.</Text>
        <Spacer height={12} />
        <RadioButtons
          options={vm.mapTypeOptions}
          selectedValue={MapStore.mapType}
          setValue={MapStore.setMapType}
        />
      </UICard>
      <Spacer height={16} />
      {Platform.OS === 'android' && (
        <>
          <UICard>
            <Text style={[s.titleText, { color: colors.textFirst }]}>Тип маркера</Text>
            <Spacer height={4} />
            <Text style={[s.descriptionText, { color: colors.textSecond }]}>
              Выбор типа маркера на Google Maps.
            </Text>
            <Spacer height={12} />
            <RadioButtons
              options={vm.markerTypeOptions}
              selectedValue={MapStore.markerType}
              setValue={MapStore.setMarkerType}
            />
          </UICard>
          <Spacer height={16} />
        </>
      )}
    </Container>
  )
})

const s = StyleSheet.create({
  descriptionText: {
    fontWeight: '400',
    fontSize: 13,
    lineHeight: 20,
  },
  titleText: {
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '800',
  },
})
