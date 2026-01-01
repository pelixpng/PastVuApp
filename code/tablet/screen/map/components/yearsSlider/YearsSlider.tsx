import { FC, useState, memo } from 'react'
import { Slider } from '@miblanchard/react-native-slider'
import { s } from './style'
import { View, Text } from 'react-native'
import { useTheme } from '@react-navigation/native'
import { YearsRangeType } from '../../../../../core/types/components'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'

type YearsSliderComponentProps = {
  value: YearsRangeType
  setValue: (value: YearsRangeType) => void
}

const YearsSliderComponent: FC<YearsSliderComponentProps> = ({ value, setValue }) => {
  const { colors } = useTheme()
  const tabBarHeight = useBottomTabBarHeight()
  const [tmpRange, setTmpRange] = useState<YearsRangeType>(value)
  return (
    <View style={[s.container, { bottom: tabBarHeight, backgroundColor: colors.backgroundApp }]}>
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
        onValueChange={setTmpRange}
        onSlidingComplete={setValue}
      />
      <View style={s.row}>
        <Text style={[s.currentYearsText, { color: colors.textSecond }]}>1826</Text>
        <Text style={[s.currentYearsText, { color: colors.textSecond }]}>2000</Text>
      </View>
    </View>
  )
}

export const YearsSlider = memo(YearsSliderComponent)
