import styled from 'styled-components/native'
import { StyleSheet } from 'react-native'
export const PostTitleText = styled.Text`
  font-size: 20;
  font-weight: 800;
  line-height: 24;
  color: ${props => props.theme.colors.textFirst};
`
export const PostLocationText = styled.Text`
  font-size: 13;
  font-weight: 500;
  line-height: 20;
  color: ${props => props.theme.colors.textSecond};
`
export const LastEditText = styled.Text`
  font-size: 13;
  font-weight: 500;
  line-height: 20;
  color: ${props => props.theme.colors.textThird};
`
export const CommentHeader = styled.Text<{ count?: boolean }>`
  font-size: 17;
  font-weight: 800;
  line-height: 28;
  color: ${props => (props.count ? props.theme.colors.textThird : props.theme.colors.textFirst)};
`
export const s = StyleSheet.create({
  texts: { gap: 8, marginBottom: 16, marginTop: 4 },
  block: { marginTop: 16, flexDirection: 'row' },
})
