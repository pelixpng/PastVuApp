import styled, { css } from 'styled-components/native'
import { StyleSheet } from 'react-native'

const sharedStyles = css`
  font-size: 13px;
  font-weight: 500;
  line-height: 20px;
`

export const TitleSliderText = styled.Text`
  ${sharedStyles}
  color: ${props => props.theme.colors.textFirst};
`

export const MinMaxRangeText = styled.Text`
  ${sharedStyles}
  color: ${props => props.theme.colors.textSecond};
`

export const s = StyleSheet.create({
  thumb: { height: 15, width: 15 },
  container: { height: 25 },
  sliderContainer: { width: '100%' },
  labelTextContainer: { justifyContent: 'space-between', flexDirection: 'row' },
})
