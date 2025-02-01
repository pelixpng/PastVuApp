import styled from 'styled-components/native'
import { StyleSheet } from 'react-native'

export const s = StyleSheet.create({
  block: { gap: 16, width: '100%' },
  container: {
    gap: 12,
    flexDirection: 'row',
  },
})
export const LabelText = styled.Text`
  font-size: 15px;
  line-height: 24px;
  font-weight: 500;
  color: ${props => props.theme.colors.textFirst};
`

export const RadioButton = styled.View<{ isActive: boolean }>`
  width: 24px;
  height: 24px;
  border-radius: 50px;
  background-color: ${({ isActive, theme }) =>
    isActive ? theme.colors.backgroundApp : theme.colors.baseFourth};
  border: ${({ isActive, theme }) => (isActive ? `6px solid ${theme.colors.basePrimary}` : 'none')};
`
