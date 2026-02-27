import { RadioButtons } from '../../../../core/components/ui/buttons/radioButton/RadioButtons'
import { Container } from '../../../../core/components/ui/Container'
import { UICard } from '../../../../core/components/ui/UICards'
import { Text, StyleSheet, Platform, Alert } from 'react-native'
import { useTheme } from '@react-navigation/native'
import { Spacer } from '../../../../core/components/ui/Spacer'
import ApiStore from '../../../../core/store/Api.store'
import MapStore from '../../../../core/store/Map.store'
import ThemeStore from '../../../../core/store/Theme.store'
import { SliderComponent } from '../../../../mobile/screens/settings/appSettings/components/settingsSlider/SliderSettings'
import { SettingsOptions } from '../../../../core/constants/settings'
import { observer } from 'mobx-react'

const setMapProvider = (value: string) => {
  if (value === 'yandex') {
    Alert.alert(
      'Яндекс Карты (Beta)',
      'Карта находится в ранней версии, возможны баги и нестабильная работа.\n\n' +
        'При тёмной теме отображение может быть некорректным — рекомендуется светлая тема.\n\n' +
        'Слои «Спутник» и «Гибрид» в данный момент не поддерживаются.\n\n' +
        `Бесплатный API Яндекс Карт рассчитан на 1000 пользователей в день. Если карта не загружается — лимит возможно исчерпан. В таком случае рекомендуется переключиться на ${Platform.OS === 'ios' ? 'Apple Maps' : 'Google Maps'}.`,
      [{ text: 'Понятно' }],
    )
  }
  MapStore.setMapProvider(value)
}

export const AppSettingsScreen = observer(() => {
  const { colors } = useTheme()
  return (
    <Container isScroll style={s.container}>
      <Spacer height={18} />
      <UICard>
        <Text style={[s.titleText, { color: colors.textFirst }]}>Параметры карты</Text>
        <Spacer height={4} />
        <Text style={[s.descriptionText, { color: colors.textSecond }]}>
          Сгруппировать фото на карте (как на веб версии) ?
        </Text>
        <Spacer height={12} />
        <RadioButtons
          options={SettingsOptions.showClusterOptions}
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
          options={SettingsOptions.themeOptions}
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
          options={SettingsOptions.photoQualityOptions}
          selectedValue={ApiStore.photoQualitySettings}
          setValue={ApiStore.setPhotoQuality}
        />
      </UICard>
      <Spacer height={16} />
      <UICard>
        <Text style={[s.titleText, { color: colors.textFirst }]}>Картографический сервис</Text>
        <Spacer height={4} />
        <Text style={[s.descriptionText, { color: colors.textSecond }]}>
          Выбор провайдера карты.
        </Text>
        <Spacer height={12} />
        <RadioButtons
          options={SettingsOptions.mapProviderOptions}
          selectedValue={MapStore.mapProvider}
          setValue={setMapProvider}
        />
      </UICard>
      <Spacer height={16} />
      {MapStore.mapProvider !== 'yandex' && (
        <>
          <UICard>
            <Text style={[s.titleText, { color: colors.textFirst }]}>Тип карты</Text>
            <Spacer height={4} />
            <Text style={[s.descriptionText, { color: colors.textSecond }]}>Выбор слоя карты.</Text>
            <Spacer height={12} />
            <RadioButtons
              options={SettingsOptions.mapTypeOptions}
              selectedValue={MapStore.mapType}
              setValue={MapStore.setMapType}
            />
          </UICard>
          <Spacer height={16} />
        </>
      )}
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
              options={SettingsOptions.markerTypeOptions}
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
  container: { paddingRight: 48, paddingLeft: 32 },
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
