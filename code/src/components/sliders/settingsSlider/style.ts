import styled from 'styled-components/native'
import { StyleSheet } from 'react-native'

export const TitleSliderText = styled.Text`
  font-size: 13;
  font-weight: 500;
  line-height: 20;
  color: ${props => props.theme.colors.textFirst};
`

export const MinMaxRangeText = styled.Text`
  font-size: 13;
  font-weight: 500;
  line-height: 20;
  color: ${props => props.theme.colors.textSecond};
`

export const s = StyleSheet.create({
  thumb: { height: 15, width: 15 },
  container: { height: 25 },
  sliderContainer: { width: '100%' },
  labelTextContainer: { justifyContent: 'space-between', flexDirection: 'row' },
})
