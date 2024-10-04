import styled from 'styled-components/native'
import { StyleSheet } from 'react-native'

export const s = StyleSheet.create({
  block: { gap: 16, width: '100%' },
  container: {
    gap: 12,
    flexDirection: 'row',
  },
})

export const NoActiveButton = styled.View`
  width: 24;
  height: 24;
  border-radius: 50px;
  background-color: ${props => props.theme.colors.baseFourth};
`

export const LabelText = styled.Text`
  font-size: 15;
  line-height: 24;
  font-weight: 500;
  color: ${props => props.theme.colors.textFirst};
`

export const ActiveButton = styled.View`
  width: 24;
  height: 24;
  border-radius: 50px;
  background-color: ${props => props.theme.colors.backgroundApp};
  border: 6px solid ${props => props.theme.colors.basePrimary};
`
