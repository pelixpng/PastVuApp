import { StyleSheet } from 'react-native'
import styled from 'styled-components/native'

export const CommentContainer = styled.View<{ isParent: number | undefined }>`
  flex-direction: row;
  gap: 8;
  margin-bottom: 12;
  margin-left: auto;
  width: ${props => (props.isParent ? '88%' : '100%')};
`

export const CommentAuthorName = styled.Text`
  font-weight: 800;
  font-size: 13;
  line-height: 20;
  color: ${props => props.theme.colors.textFirst};
`
export const DateText = styled.Text`
  color: ${props => props.theme.colors.textThird};
  font-size: 11;
  line-height: 16;
  font-weight: 500;
`

export const s = StyleSheet.create({
  image: {
    width: 40,
    height: 40,
    borderRadius: 200,
  },
  CommentTextContainer: { flex: 1 },
  row: { flexDirection: 'row', gap: 8, alignItems: 'center' },
})
