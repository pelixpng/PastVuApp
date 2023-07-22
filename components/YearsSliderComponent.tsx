import styled from 'styled-components/native'
import { FC, useState } from 'react'
import { Text, View } from 'react-native'
import { perfectSize } from '../utils/ScreenSize'
import { Slider } from '@miblanchard/react-native-slider'
import { DefaultTheme, useTheme } from 'styled-components';
import { linearGradient } from 'polished';

export const YearsSlider: FC = () => {
  return (
    <SliderComponentBack>
      <SliderLoyaut>
        <CurentYearsContainer>
          <CurentYearsText>1900-1917</CurentYearsText>
        </CurentYearsContainer>
        <SliderBodyContainer>
        <Slider
                    animateTransitions
                    maximumValue={2000}
                    minimumValue={1826}
                    step={2}
                    thumbTintColor="#1a9274"
                    value={[1900, 1917]}
                    //trackStyle={{backgroundColor: 'linear-gradient(90deg, #0E00B6 0%, #FA00FF 41.46%, #F00 61.19%, #FFFB00 79.74%, #05FF00 98.23%)'}}
                    
                />
        </SliderBodyContainer>
        
      </SliderLoyaut>
    </SliderComponentBack>
  )
}

export const SliderBodyContainer = styled.View`
  width: 100%;
`

export const SliderComponentBack = styled.View`
  width: 100%;
  height: ${perfectSize(76)};
  border-radius: 16px 16px 0px 0px;
  background: ${linearGradient('90deg', '#0E00B6', '#FA00FF', '#F00', '#FFFB00', '#05FF00')};
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 999;
`
const SliderLoyaut = styled.View`
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
`
const CurentYearsContainer = styled.View`
  display: flex;
  justify-content: space-between;
  align-items: center;
  align-self: stretch;
`
const CurentYearsText = styled.Text`
  font-size: 13px;
  font-style: normal;
  font-weight: 500;
  line-height: 20px;
  color: rgba(27, 31, 59, 0.65);
  text-align: center;
`