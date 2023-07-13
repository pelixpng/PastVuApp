import styled from 'styled-components/native'
import { perfectSize } from '../utils/ScreenSize'
import { Platform } from 'react-native'
import { StyledColor } from '../types/styled'
import { DefaultTheme } from 'styled-components'


export const ScrollContainer = styled.ScrollView`
	background: ${props => props.theme.colors.backgroundApp};
    height: 100%;
    width: 100%;
`

export const MenuContainer = styled.TouchableOpacity`
  flex-direction: row;
  display: flex;
  width: ${perfectSize(364)};
  padding: 20px;
  align-items: flex-start;
  gap: 12px;
  border-radius: 16px;
  background: white;
  align-self: center;
  margin-top: 20px;
  ${Platform.OS === 'android' ? 'elevation: 4;' : 'shadow-color: rgba(0, 0, 0, 0.12); shadow-opacity: 1; shadow-radius: 4px; shadow-offset: 0px 4px;'}
`
export const MenuTextContainer = styled.View`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    flex: 1 0 0;
`
export const MenuTitleText = styled.Text`
    font-size: ${perfectSize(20)};
    font-style: normal;
    font-weight: 800;
    line-height: ${perfectSize(24)};
    color: ${props => props.theme.colors.titleMenuText};
`

export const MenuDescriptionText = styled.Text`
    font-size: ${perfectSize(14)};
    font-style: normal;
    font-weight: 500;
    line-height: ${perfectSize(24)};
    color: ${props => props.theme.colors.MenuDescriptionText};
`
export const BackgroundMenuIcon = styled.View`
    display: flex;
    width: ${perfectSize(44)};
    height: ${perfectSize(44)};
    padding: 10px;
    justify-content: center;
    align-items: center;
    background-color: ${props => props.theme.colors.BackgroundMenuIcon};
    border-radius: 1000px;
`