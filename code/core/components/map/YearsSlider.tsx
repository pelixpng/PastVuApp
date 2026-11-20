import { FC, useState, memo } from 'react'
import { Slider } from '@miblanchard/react-native-slider'
import { StyleSheet, View, Text } from 'react-native'
import { useTheme } from '@react-navigation/native'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { YearsRangeType } from '../../types/components'

type YearsSliderProps = {
  value: YearsRangeType
  setValue: (value: YearsRangeType) => void
  /**
   * The tablet's left column: the slider's card stands there on the floating tab bar, `left` from
   * the screen's left edge and `width` wide. Without it, the phone's whole width at the bottom.
   */
  column?: { left: number; width: number }
}

/** How far the slider reaches up from its bottom edge, in points: padding, two lines and the track. */
export const YEARS_SLIDER_HEIGHT = 12 + 20 + 25 + 20 + 8

const YearsSliderComponent: FC<YearsSliderProps> = ({ value, setValue, column }) => {
  const { colors } = useTheme()
  const tabBarHeight = useBottomTabBarHeight()
  const [tmpRange, setTmpRange] = useState<YearsRangeType>(value)
  return (
    <View
      style={[
        s.container,
        { backgroundColor: colors.backgroundApp },
        column
          ? { bottom: tabBarHeight, width: column.width, left: column.left }
          : { bottom: 0, width: '100%' },
      ]}>
      <Text style={[s.currentYearsText, { color: colors.textFirst }]}>
        {tmpRange[0]}-{tmpRange[1]}
      </Text>
      <Slider
        animateTransitions
        maximumTrackTintColor={colors.baseThird}
        maximumValue={2000}
        minimumTrackTintColor={colors.basePrimary}
        minimumValue={1826}
        step={1}
        thumbTintColor={colors.basePrimary}
        thumbStyle={s.thumb}
        thumbTouchSize={{ width: 20, height: 20 }}
        containerStyle={s.containerSlider}
        value={tmpRange}
        onValueChange={value => setTmpRange(value as YearsRangeType)}
        onSlidingComplete={value => setValue(value as YearsRangeType)}
      />
      <View style={s.row}>
        <Text style={[s.currentYearsText, { color: colors.textSecond }]}>1826</Text>
        <Text style={[s.currentYearsText, { color: colors.textSecond }]}>2000</Text>
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  currentYearsText: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 20,
    textAlign: 'center',
  },
  thumb: { height: 16, width: 16 },
  containerSlider: {
    height: 25,
    width: '100%',
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  container: {
    paddingHorizontal: 24,
    paddingBottom: 8,
    paddingTop: 12,
    zIndex: 8,
    position: 'absolute',
    borderTopRightRadius: 16,
    borderTopLeftRadius: 16,
  },
})

export const YearsSlider = memo(YearsSliderComponent)