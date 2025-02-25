import { FC, useState, memo } from 'react'
import { DefaultTheme, useTheme } from 'styled-components'
import { Slider } from '@miblanchard/react-native-slider'
import { SliderComponentBack, CurrentYearsText, s, RangeYearsText } from './style'
import { View } from 'react-native'
import { YearsRangeType } from '../../../../../types/components'

type YearsSliderComponentProps = {
  value: YearsRangeType
  setValue: (value: YearsRangeType) => void
}

const YearsSliderComponent: FC<YearsSliderComponentProps> = ({ value, setValue }) => {
  const theme: DefaultTheme = useTheme()
  const [tmpRange, setTmpRange] = useState<YearsRangeType>(value)
  return (
    <SliderComponentBack>
      <CurrentYearsText>
        {tmpRange[0]}-{tmpRange[1]}
      </CurrentYearsText>
      <Slider
        animateTransitions
        maximumTrackTintColor={theme.colors.baseThird}
        maximumValue={2000}
        minimumTrackTintColor={theme.colors.basePrimary}
        minimumValue={1826}
        step={1}
        thumbTintColor={theme.colors.basePrimary}
        thumbStyle={s.thumb}
        thumbTouchSize={{ width: 20, height: 20 }}
        containerStyle={s.container}
        value={tmpRange}
        onValueChange={setTmpRange}
        onSlidingComplete={setValue}
      />
      <View style={s.row}>
        <RangeYearsText>1826</RangeYearsText>
        <RangeYearsText>2000</RangeYearsText>
      </View>
    </SliderComponentBack>
  )
}

export const YearsSlider = memo(YearsSliderComponent)
