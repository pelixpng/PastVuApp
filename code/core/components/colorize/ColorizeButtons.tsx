import { FC } from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { observer } from 'mobx-react-lite'
import { useTheme } from '@react-navigation/native'
import Animated, { Easing, ZoomIn, ZoomOut } from 'react-native-reanimated'
import { HeaderIconButton } from '../ui/buttons/HeaderIconButton'
import { PostColorize } from '../../store/PostColorize'
import { t } from '../../i18n'

const BUTTON_IN = ZoomIn.duration(220).easing(Easing.out(Easing.cubic))
const BUTTON_OUT = ZoomOut.duration(160)

type Props = {
  colorize: PostColorize
  /** The comparison with the original belongs to the post, not to the then-and-now view. */
  showCompareOriginal?: boolean
}

/**
 * The tablet's colour buttons for a header row of 44 pt buttons 4 pt apart, each followed by that
 * gap. Once coloured, the button stacking the colour version above the original grows in on the
 * left. The palette, only on black-and-white photos, colours the photo or goes back to the
 * original, with a spinner in its place meanwhile.
 */
export const ColorizeButtons: FC<Props> = observer(({ colorize, showCompareOriginal = true }) => {
  const { colors } = useTheme()
  return (
    <>
      {showCompareOriginal && colorize.isColorized && !colorize.isColorizing && (
        <Animated.View style={s.gap} entering={BUTTON_IN} exiting={BUTTON_OUT}>
          <HeaderIconButton
            name="view-agenda"
            color={colorize.isComparingOriginal ? colors.basePrimary : colors.textFirst}
            onPress={colorize.toggleCompareOriginal}
            accessibilityLabel={
              colorize.isComparingOriginal ? t('colorize.compareHide') : t('colorize.compare')
            }
          />
        </Animated.View>
      )}
      {colorize.isColorizing ? (
        <View style={[s.spinner, s.gap]}>
          <ActivityIndicator color={colors.textFirst} />
        </View>
      ) : colorize.canColorize ? (
        <View style={s.gap}>
          <HeaderIconButton
            name="palette"
            color={colorize.isColorized ? colors.basePrimary : colors.textFirst}
            onPress={colorize.toggle}
            accessibilityLabel={colorize.isColorized ? t('colorize.original') : t('colorize.start')}
          />
        </View>
      ) : null}
    </>
  )
})

const s = StyleSheet.create({
  gap: { marginRight: 4 },
  // The 44 pt box of a header button, so the row does not shift while the photo is being coloured.
  spinner: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
})
