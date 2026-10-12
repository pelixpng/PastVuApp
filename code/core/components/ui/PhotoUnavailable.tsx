import { FC } from 'react'
import { DimensionValue, StyleSheet, Text, View } from 'react-native'
import { useTheme } from '@react-navigation/native'
import { observer } from 'mobx-react-lite'
import { MaterialIcons } from './icons'
import { t } from '../../i18n'

type Props = {
  width?: DimensionValue
  height: number
  /** Called once it is on screen, like the image it replaces, so loaders waiting on it stop. */
  onLayout?: () => void
}

/**
 * Stands in for a photo whose file the site no longer serves. Removed photos keep their page,
 * title and comments in the API, but their image answers 404, which left a blank square.
 */
export const PhotoUnavailable: FC<Props> = observer(({ width = '100%', height, onLayout }) => {
  const { colors } = useTheme()
  return (
    <View
      onLayout={onLayout}
      style={[s.container, { width, height, backgroundColor: colors.baseFifth }]}>
      <MaterialIcons name="no-photography" size={48} color={colors.textThird} />
      <Text style={[s.text, { color: colors.textThird }]}>{t('photo.unavailable')}</Text>
    </View>
  )
})

const s = StyleSheet.create({
  container: { justifyContent: 'center', alignItems: 'center', gap: 8 },
  text: { fontSize: 13, lineHeight: 20, fontWeight: '500' },
})
