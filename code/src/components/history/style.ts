import { StyleSheet } from 'react-native'
import styled from 'styled-components/native'

export const TitleText = styled.Text`
  font-size: 13;
  line-height: 20;
  font-weight: 800;
  color: ${props => props.theme.colors.textFirst};
`

export const DescriptionText = styled.Text`
  font-weight: 500;
  font-size: 13;
  line-height: 20;
  color: ${props => props.theme.colors.textThird};
`

export const s = StyleSheet.create({
  image: {
    width: 80,
    height: 80,
    borderRadius: 16,
  },
  mainContainer: { flexDirection: 'row', gap: 12, marginVertical: 8, marginHorizontal: 16 },
  infoContainer: { gap: 4, flex: 1 },
})
