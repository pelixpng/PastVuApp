import { FC, useState } from 'react'
import { StyleSheet, Text, TouchableOpacity } from 'react-native'
import { observer } from 'mobx-react-lite'
import { useTheme } from '@react-navigation/native'
import { UICard } from '../ui/UICards'
import { Spacer } from '../ui/Spacer'
import { ConfirmationSheet } from '../ui/confirmationSheet/ConfirmationSheet'
import ColorizerModel, { INSTALLED_BYTES } from '../../store/ColorizerModel.store'
import { t } from '../../i18n'

const INSTALLED_MB = Math.round(INSTALLED_BYTES / 1_000_000)

/**
 * The settings card for the downloaded colorization model: what it takes and a way to delete it.
 * Shown only while the model is on the device, followed by the 16 pt gap the cards keep.
 */
export const ColorizerModelCard: FC = observer(() => {
  const { colors } = useTheme()
  const [confirming, setConfirming] = useState(false)
  if (!ColorizerModel.isInstalled) return null
  return (
    <>
      <UICard>
        <Text style={[s.title, { color: colors.textFirst }]}>{t('colorizeModel.settingsTitle')}</Text>
        <Spacer height={4} />
        <Text style={[s.description, { color: colors.textSecond }]}>
          {t('colorizeModel.settingsDescription', { size: INSTALLED_MB })}
        </Text>
        <Spacer height={12} />
        <TouchableOpacity
          style={[s.button, { backgroundColor: colors.baseFourth }]}
          onPress={() => setConfirming(true)}
          activeOpacity={0.7}>
          <Text style={[s.buttonText, { color: colors.textFirst }]}>{t('colorizeModel.remove')}</Text>
        </TouchableOpacity>
      </UICard>
      <Spacer height={16} />
      <ConfirmationSheet
        visible={confirming}
        title={t('colorizeModel.removeConfirm', { size: INSTALLED_MB })}
        onConfirm={() => {
          setConfirming(false)
          ColorizerModel.remove()
        }}
        onCancel={() => setConfirming(false)}
      />
    </>
  )
})

const s = StyleSheet.create({
  title: { fontSize: 15, lineHeight: 24, fontWeight: '800' },
  description: { fontWeight: '400', fontSize: 13, lineHeight: 20 },
  button: { paddingVertical: 10, borderRadius: 12, alignItems: 'center' },
  buttonText: { fontSize: 15, fontWeight: '800' },
})
