import { StyleSheet } from 'react-native'
import styled from 'styled-components/native'

export const CommentContainer = styled.View<{ isParent: number | undefined }>`
  flex-direction: row;
  gap: 8px;
  margin-bottom: 12px;
  margin-left: auto;
  width: ${props => (props.isParent ? '88%' : '100%')};
`

export const CommentAuthorName = styled.Text`
  font-weight: 800;
  font-size: 13px;
  line-height: 20px;
  color: ${props => props.theme.colors.textFirst};
`
export const DateText = styled.Text`
  color: ${props => props.theme.colors.textThird};
  font-size: 11px;
  line-height: 16px;
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
