import styled from 'styled-components/native'
import { StyleSheet } from 'react-native'

export const PostTitleText = styled.Text`
  font-size: 20px;
  font-weight: 800;
  line-height: 24px;
  color: ${props => props.theme.colors.textFirst};
`
export const PostLocationText = styled.Text`
  font-size: 13px;
  font-weight: 500;
  line-height: 20px;
  color: ${props => props.theme.colors.textSecond};
`
export const LastEditText = styled.Text`
  font-size: 13px;
  font-weight: 500;
  line-height: 20px;
  color: ${props => props.theme.colors.textThird};
`
export const CommentHeader = styled.Text<{ count?: boolean }>`
  font-size: 17px;
  font-weight: 800;
  line-height: 28px;
  color: ${props => (props.count ? props.theme.colors.textThird : props.theme.colors.textFirst)};
`
export const s = StyleSheet.create({
  texts: { gap: 8, marginBottom: 16, marginTop: 4 },
  block: { marginTop: 16, flexDirection: 'row' },
})
