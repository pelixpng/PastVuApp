import styled from 'styled-components/native'

export const MenuTitleText = styled.Text`
  font-size: 15px;
  font-weight: 800;
  line-height: 24px;
  color: ${props => props.theme.colors.textFirst};
`

export const MenuDescriptionText = styled.Text`
  font-size: 13px;
  font-weight: 400;
  line-height: 20px;
  color: ${props => props.theme.colors.textSecond};
`
