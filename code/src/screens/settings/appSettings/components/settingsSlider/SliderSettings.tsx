import { FC } from 'react'
import { Slider } from '@miblanchard/react-native-slider'
import { DefaultTheme, useTheme } from 'styled-components'
import { View } from 'react-native'
import { MinMaxRangeText, s, TitleSliderText } from './style'

type SliderComponentProps = {
  value: number
  setValue: (value: number[]) => void
  title: string
  minValue: number
  maxValue: number
}

export const SliderComponent: FC<SliderComponentProps> = ({
  value,
  setValue,
  title,
  minValue,
  maxValue,
}) => {
  const theme: DefaultTheme = useTheme()
  return (
    <View style={s.sliderContainer}>
      <View style={s.labelTextContainer}>
        <TitleSliderText>{title}</TitleSliderText>
        <TitleSliderText>{value.toString()}</TitleSliderText>
      </View>
      <Slider
        minimumValue={minValue}
        maximumValue={maxValue}
        thumbStyle={s.thumb}
        containerStyle={s.container}
        thumbTintColor={theme.colors.basePrimary}
        animateTransitions={true}
        maximumTrackTintColor={theme.colors.baseThird}
        minimumTrackTintColor={theme.colors.basePrimary}
        value={value}
        onValueChange={setValue}
        step={1}
      />
      <View style={s.labelTextContainer}>
        <MinMaxRangeText>{minValue.toString()}</MinMaxRangeText>
        <MinMaxRangeText>{maxValue.toString()}</MinMaxRangeText>
      </View>
    </View>
  )
}
