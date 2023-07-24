import styled from 'styled-components/native'
import { FC, useState } from 'react'
import { Text, View } from 'react-native'
import { perfectSize } from '../utils/ScreenSize'

import { DefaultTheme, useTheme } from 'styled-components';
import { linearGradient } from 'polished';
import { Slider } from '@miblanchard/react-native-slider'
import StorageServiceMMKV, { Storage } from '../Storage/Storage';

type SliderComponentProps = {
  value: YearsRangeType;
  setValue: (value: YearsRangeType) => void;
}

export const YearsSlider: FC<SliderComponentProps> = ({value, setValue}) => {
  const [tmpRange, setTmpRange] = useState<YearsRangeType>(value)
  const changeyears = () =>{
    setValue(tmpRange)
    StorageServiceMMKV.saveYearsRange(tmpRange)
  }
  return (
    <SliderComponentBack>
      {/* <SliderLoyaut> */}
        {/* <CurentYearsContainer> */}
          <CurentYearsText>{tmpRange[0]}-{tmpRange[1]}</CurentYearsText>
        {/* </CurentYearsContainer> */}
        <SliderBodyContainer>
        <Slider
          animateTransitions
          maximumTrackTintColor="#d3d3d3"
          maximumValue={2000}
          minimumTrackTintColor="#1fb28a"
          minimumValue={1826}
          step={1}
          thumbTintColor="#1a9274"
          thumbStyle={{height: perfectSize(15), width: perfectSize(15)}}
          containerStyle={{height: perfectSize(25)}}
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
      {/* </SliderLoyaut> */}
    </SliderComponentBack>
  )
}





export const SliderBodyContainer = styled.View`
  background-color: green;
  width: 100%;
`

export const SliderComponentBack = styled.View`
  width: 100%;
  height: auto;
  border-radius: 16px 16px 0px 0px;
  background-color: white;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 999;
  padding: 6px;
  
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 5px;
`
// const SliderLoyaut = styled.View`
//   display: flex;
//   width: 100%;
//   flex-direction: column;
//   align-items: flex-start;
//   gap: 10px;
// `
const CurentYearsContainer = styled.View`
  display: flex;
  justify-content: space-between;
  align-items: center;
  align-self: stretch;
  background-color: aqua;
`
const CurentYearsText = styled.Text`
  font-size: 13px;
  font-style: normal;
  font-weight: 500;
  line-height: 20px;
  color: rgba(27, 31, 59, 0.65);
  text-align: center;
  align-self: center;
  
`
const YearsTitleContainer = styled.View`
  background-color: pink;
  justify-content: space-between;
  flex-direction: row;
  align-self: stretch;
`