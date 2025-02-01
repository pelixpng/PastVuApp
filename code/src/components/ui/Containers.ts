import styled from 'styled-components/native'
import { Platform } from 'react-native'

export const ViewContainer = styled.View`
  background: ${props => props.theme.colors.backgroundApp};
  height: 100%;
`

export const ScrollContainer = styled.ScrollView`
  background: ${props => props.theme.colors.backgroundApp};
`

export const MenuContainer = styled.TouchableOpacity`
  flex-direction: row;
  justify-content: space-between;
  padding: 16px;
  gap: 12px;
  margin-top: 8px;
  margin-bottom: 8px;
  margin-left: 16px;
  margin-right: 16px;
  border-radius: 16px;
  overflow: visible;
  background: ${props => props.theme.colors.baseSecond};
  ${Platform.OS === 'android'
    ? 'elevation: 4;'
    : 'shadow-color: rgba(0, 0, 0, 0.12); shadow-opacity: 1; shadow-radius: 4px; shadow-offset: 0px 4px;'}
`
