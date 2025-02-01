import styled from 'styled-components/native'
import { StyleSheet } from 'react-native'

export const SliderComponentBack = styled.View`
  width: 100%;
  border-radius: 16px 16px 0px 0px;
  background-color: ${props => props.theme.colors.backgroundApp};
  position: absolute;
  bottom: 0;
  z-index: 8;
  padding-top: 12px;
  padding-bottom: 8px;
  padding-left: 24px;
  padding-right: 24px;
`
export const CurrentYearsText = styled.Text`
  font-size: 13px;
  font-weight: 500;
  line-height: 20px;
  color: ${props => props.theme.colors.textFirst};
  text-align: center;
  align-self: center;
`
export const RangeYearsText = styled.Text`
  font-size: 13px;
  font-weight: 500;
  line-height: 20px;
  color: ${props => props.theme.colors.textSecond};
  text-align: center;
  align-self: center;
`

export const YearsTitleContainer = styled.View`
  justify-content: space-between;
  flex-direction: row;
  align-self: stretch;
`
export const s = StyleSheet.create({
  thumb: { height: 16, width: 16 },
  container: {
    height: 25,
    width: '100%',
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
})
