import { FC } from 'react'
import { Slider } from '@miblanchard/react-native-slider'
import { View, Text } from 'react-native'
import { useTheme } from '@react-navigation/native'
import { s } from './style'

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
  const { colors } = useTheme()
  return (
    <View style={s.sliderContainer}>
      <View style={s.labelTextContainer}>
        <Text style={[s.labelText, { color: colors.textFirst }]}>{title}</Text>
        <Text style={[s.labelText, { color: colors.textFirst }]}>{value.toString()}</Text>
      </View>
      <Slider
        minimumValue={minValue}
        maximumValue={maxValue}
        thumbStyle={s.thumb}
        containerStyle={s.container}
        thumbTintColor={colors.basePrimary}
        animateTransitions={true}
        maximumTrackTintColor={colors.baseThird}
        minimumTrackTintColor={colors.basePrimary}
        value={value}
        onValueChange={setValue}
        step={1}
      />
      <View style={s.labelTextContainer}>
        <Text style={[s.labelText, { color: colors.textSecond }]}>{minValue.toString()}</Text>
        <Text style={[s.labelText, { color: colors.textSecond }]}>{maxValue.toString()}</Text>
      </View>
    </View>
  )
}
