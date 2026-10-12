import { FC, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { OptionsRadioButton, RadioButtons } from '../ui/buttons/radioButton/RadioButtons'
import { ConfirmationSheet } from '../ui/confirmationSheet/ConfirmationSheet'
import MapStore from '../../store/Map.store'
import { Links } from '../../constants/links'
import { t } from '../../i18n'

/**
 * The map provider setting. Yandex collects the user's IP address, device ID and location (its
 * terms, 8.1, which also make the app vouch for the user's consent), so the first time Yandex Maps
 * is picked the user is told and asked; the choice only changes once they agree.
 */
export const MapProviderRadio: FC<{ options: OptionsRadioButton[] }> = observer(({ options }) => {
  const [asking, setAsking] = useState(false)
  const select = (value: string) => {
    if (value === 'yandex' && !MapStore.yandexConsent) setAsking(true)
    else MapStore.setMapProvider(value)
  }
  return (
    <>
      <RadioButtons options={options} selectedValue={MapStore.mapProvider} setValue={select} />
      <ConfirmationSheet
        visible={asking}
        title={t('appSettings.yandexConsent')}
        confirmText={t('appSettings.yandexConsentConfirm')}
        link={{ title: t('about.yandexTerms'), url: Links.yandexTerms }}
        onConfirm={() => {
          setAsking(false)
          MapStore.acceptYandex()
        }}
        onCancel={() => setAsking(false)}
      />
    </>
  )
})
