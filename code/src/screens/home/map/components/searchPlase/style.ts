import styled from 'styled-components/native'
import { WIDTH, INSET_TOP } from '../../../../../constants/sizes'
import { StyleSheet, Platform } from 'react-native'

export const s = StyleSheet.create({
  container: {
    width: WIDTH - 32,
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 9,
    marginTop: INSET_TOP,
  },
  textInputContainer: {
    paddingRight: 8,
    paddingLeft: 12,
    gap: 8,
    alignItems: 'center',
    borderRadius: 12,
  },
  textInput: {
    paddingHorizontal: 0,
    paddingTop: Platform.OS === 'ios' ? 0 : 4,
    fontSize: 13,
    marginBottom: 0,
    lineHeight: 20,
    fontStyle: 'normal',
  },
  separator: {
    height: 12,
    opacity: 0,
  },
  row: {
    height: 20,
    padding: 0,
  },
  listView: {
    paddingVertical: 12,
    marginTop: 10,
    borderRadius: 12,
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
})

export const RowContainer = styled.View`
  height: 20;
  width: 100%;
  padding-left: 20;
  padding-right: 8;
  flex-direction: row;
  gap: 16;
  background-color: ${props => props.theme.colors.backgroundApp};
`
export const Ball = styled.View`
  width: 8;
  height: 8;
  border-radius: 20px;
  background-color: ${props => props.theme.colors.baseThird};
  align-self: center;
`
export const ResultText = styled.Text`
  font-size: 13;
  font-weight: 500;
  line-height: 20;
  color: ${props => props.theme.colors.textFirst};
`
