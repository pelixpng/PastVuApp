import styled from 'styled-components/native'

export const MenuTitleText = styled.Text`
  font-size: 15;
  font-weight: 800;
  line-height: 24;
  color: ${props => props.theme.colors.textFirst};
`

export const MenuDescriptionText = styled.Text`
  font-size: 13;
  font-weight: 400;
  line-height: 20;
  color: ${props => props.theme.colors.textSecond};
`
