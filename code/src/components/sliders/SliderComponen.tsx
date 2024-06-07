import styled from 'styled-components/native'
import { FC } from 'react'
import { perfectSize } from '../../utils/ScreenSize'
import { Slider } from '@miblanchard/react-native-slider'
import { DefaultTheme, useTheme } from 'styled-components'
import { StyleSheet } from 'react-native'

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
    <SliderContainer>
      <LabelTextContainer>
        <TitleSliderText>{title}</TitleSliderText>
        <TitleSliderText>{value.toString()}</TitleSliderText>
      </LabelTextContainer>
      <SliderBodyContainer>
        <Slider
          minimumValue={minValue}
          maximumValue={maxValue}
          thumbStyle={s.thumb}
          containerStyle={s.container}
          thumbTintColor="#526ED3"
          animateTransitions={true}
          maximumTrackTintColor={theme.colors.SliderRangeBG}
          minimumTrackTintColor="#526ED3"
          value={value}
          onValueChange={setValue}
          step={1}
        />
      </SliderBodyContainer>
      <LabelTextContainer>
        <MinMaxRangeText>{minValue.toString()}</MinMaxRangeText>
        <MinMaxRangeText>{maxValue.toString()}</MinMaxRangeText>
      </LabelTextContainer>
    </SliderContainer>
  )
}

export const SliderContainer = styled.View`
  display: flex;
  align-items: flex-start;
  width: 100%;
`
export const LabelTextContainer = styled.View`
  justify-content: space-between;
  align-items: flex-start;
  align-self: stretch;
  flex-direction: row;
`
export const TitleSliderText = styled.Text`
  font-size: ${perfectSize(14)};
  font-style: normal;
  font-weight: 500;
  line-height: ${perfectSize(20)};
  color: ${props => props.theme.colors.titleMenuText};
`

const SliderBodyContainer = styled.View`
  width: 100%;
`
export const MinMaxRangeText = styled.Text`
  font-size: ${perfectSize(14)};
  font-style: normal;
  font-weight: 500;
  line-height: ${perfectSize(20)};
  color: ${props => props.theme.colors.MenuDescriptionText};
`

const s = StyleSheet.create({
  thumb: { height: 15, width: 15 },
  container: { height: perfectSize(25) },
})
