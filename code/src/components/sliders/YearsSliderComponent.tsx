import styled from 'styled-components/native'
import React, { FC, useState } from 'react'
import { perfectSize } from '../../utils/ScreenSize'
import { DefaultTheme, useTheme } from 'styled-components'
import { Slider } from '@miblanchard/react-native-slider'
import StorageServiceMMKV from '../../storage/Storage'
import { YearsRangeType } from '../../types/components'
import { StyleSheet } from 'react-native'

type YearsSliderComponentProps = {
  value: YearsRangeType
  setValue: (value: YearsRangeType) => void
}

const YearsSliderComponent: FC<YearsSliderComponentProps> = ({ value, setValue }) => {
  const theme: DefaultTheme = useTheme()
  const [tmpRange, setTmpRange] = useState<YearsRangeType>(value)
  const changeyears = () => {
    setValue(tmpRange)
    StorageServiceMMKV.saveYearsRange(tmpRange)
  }

  return (
    <SliderComponentBack>
      <CurentYearsText>
        {tmpRange[0]}-{tmpRange[1]}
      </CurentYearsText>
      <SliderBodyContainer>
        <Slider
          animateTransitions
          maximumTrackTintColor={theme.colors.SliderRangeBG}
          maximumValue={2000}
          minimumTrackTintColor="#526ED3"
          minimumValue={1826}
          step={1}
          thumbTintColor="#526ED3"
          thumbStyle={s.thumb}
          containerStyle={s.container}
          value={tmpRange}
          onValueChange={setTmpRange}
          onSlidingComplete={changeyears}
        />
      </SliderBodyContainer>
      <YearsTitleContainer>
        <CurentYearsText>1826</CurentYearsText>
        <CurentYearsText>1884</CurentYearsText>
        <CurentYearsText>1942</CurentYearsText>
        <CurentYearsText>2000</CurentYearsText>
      </YearsTitleContainer>
    </SliderComponentBack>
  )
}

export const YearsSlider = React.memo(YearsSliderComponent)

export const SliderBodyContainer = styled.View`
  width: 100%;
`

export const SliderComponentBack = styled.View`
  width: 100%;
  border-radius: 16px 16px 0px 0px;
  background-color: ${props => props.theme.colors.backgroundApp};
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 8;
  padding-top: 6px;
  padding-bottom: 6px;
  padding-left: 10px;
  padding-right: 10px;
  display: flex;
  align-items: flex-start;
  gap: ${perfectSize(6)};
`

const CurentYearsText = styled.Text`
  font-size: ${perfectSize(14)};
  font-style: normal;
  font-weight: 400;
  line-height: ${perfectSize(20)};
  color: ${props => props.theme.colors.MenuDescriptionText};
  text-align: center;
  align-self: center;
`
const YearsTitleContainer = styled.View`
  justify-content: space-between;
  flex-direction: row;
  align-self: stretch;
`
const s = StyleSheet.create({
  thumb: { height: 15, width: 15 },
  container: { height: perfectSize(25) },
})
