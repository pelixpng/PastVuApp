import { FC } from 'react'
import { View } from 'react-native'
import { observer } from 'mobx-react-lite'
import { useTheme } from '@react-navigation/native'
import Animated, { Easing, ZoomIn, ZoomOut } from 'react-native-reanimated'
import { HeaderIconButton } from '../ui/buttons/HeaderIconButton'
import { PostColorize } from '../../store/PostColorize'
import { HEADER_GAP } from '../../utils/headerGap'
import { t } from '../../i18n'

const BUTTON_IN = ZoomIn.duration(220).easing(Easing.out(Easing.cubic))
const BUTTON_OUT = ZoomOut.duration(160)

type Props = {
  colorize: PostColorize
  /** The comparison with the original belongs to the post, not to the then-and-now view. */
  showCompareOriginal?: boolean
  /** The space after each button: the header's gap between its buttons, 4 pt by default. */
  gap?: number
}

/** Once coloured and not colouring again, the colour version can be stacked above the original. */
const showsCompareOriginalButton = (colorize: PostColorize, showCompareOriginal: boolean) =>
  showCompareOriginal && colorize.isColorized && !colorize.isColorizing

/**
 * How many buttons ColorizeButtons shows for this state, for a header that spaces its buttons by
 * how many there are (see headerGap). Read inside an observer, so the count follows the state.
 */
export const colorizeButtonCount = (colorize: PostColorize, showCompareOriginal = true) =>
  Number(showsCompareOriginalButton(colorize, showCompareOriginal)) +
  Number(colorize.isColorizing || colorize.canColorize)

/**
 * The tablet's colour buttons for a header row of 44 pt buttons, each followed by the row's gap.
 * Once coloured, the button stacking the colour version above the original grows in on the left.
 * The palette, only on black-and-white photos, colours the photo or goes back to the original; it
 * is greyed out while colouring, as the photo itself shows the progress.
 */
export const ColorizeButtons: FC<Props> = observer(
  ({ colorize, showCompareOriginal = true, gap = HEADER_GAP }) => {
    const { colors } = useTheme()
    const spacing = { marginRight: gap }
    return (
      <>
        {showsCompareOriginalButton(colorize, showCompareOriginal) && (
          <Animated.View style={spacing} entering={BUTTON_IN} exiting={BUTTON_OUT}>
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
          <View style={spacing}>
            <HeaderIconButton
              name="palette"
              color={colors.textThird}
              disabled
              accessibilityLabel={t('colorize.processing')}
            />
          </View>
        ) : colorize.canColorize ? (
          <View style={spacing}>
            <HeaderIconButton
              name="palette"
              color={colorize.isColorized ? colors.basePrimary : colors.textFirst}
              onPress={colorize.toggle}
              accessibilityLabel={
                colorize.isColorized ? t('colorize.original') : t('colorize.start')
              }
            />
          </View>
        ) : null}
      </>
    )
  },
)
