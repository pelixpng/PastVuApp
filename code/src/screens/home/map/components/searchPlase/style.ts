import styled from 'styled-components/native'
import { WIDTH, INSET_TOP } from '../../../../../constants/sizes'
import { StyleSheet } from 'react-native'

export const s = StyleSheet.create({
  container: {
    width: WIDTH - 32,
    gap: 8,
    position: 'absolute',
    zIndex: 9,
    marginTop: INSET_TOP,
    alignSelf: 'center',
  },
  list: {
    gap: 12,
    paddingVertical: 12,
    paddingLeft: 20,
    paddingRight: 8,
    borderRadius: 12,
  },
})

export const Input = styled.TextInput`
  font-size: 14px;
  font-style: normal;
  flex: 1;
  color: ${props => props.theme.colors.textFirst};
`

export const SearchContainer = styled.View`
  flex-direction: row;
  padding-left: 12px;
  padding-right: 8px;
  height: 40px;
  align-items: center;
  border-radius: 12px;
  gap: 8px;
  background-color: ${props => props.theme.colors.backgroundApp};
`

export const RowContainer = styled.TouchableOpacity`
  height: 20px;
  width: 100%;
  flex-direction: row;
  gap: 16px;
  background-color: ${props => props.theme.colors.backgroundApp};
`
export const Ball = styled.View`
  width: 8px;
  height: 8px;
  border-radius: 20px;
  background-color: ${props => props.theme.colors.baseThird};
  align-self: center;
`
export const ResultText = styled.Text`
  font-size: 13px;
  font-weight: 500;
  flex: 1;
  color: ${props => props.theme.colors.textFirst};
`
