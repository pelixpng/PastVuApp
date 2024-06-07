import styled from 'styled-components/native'
import { perfectSize } from '../../utils/ScreenSize'
import { Platform } from 'react-native'

const OS = Platform.OS

export const ViewContainer = styled.View<{ paddingTop?: number }>`
  background: ${props => props.theme.colors.backgroundApp};
  padding-top: ${props => props.paddingTop};
  height: 100%;
`

export const ScrollContainer = styled.ScrollView<{ paddingTop?: number }>`
  background: ${props => props.theme.colors.backgroundApp};
  padding-top: ${props => props.paddingTop};
`

export const MenuContainer = styled.TouchableOpacity`
  flex-direction: row;
  display: flex;
  width: 93%;
  padding: 20px;
  align-items: flex-start;
  gap: ${perfectSize(12)};
  border-radius: 16px;
  background: ${props => props.theme.colors.MenuContainer};
  align-self: center;
  margin-top: ${perfectSize(10)};
  margin-bottom: ${perfectSize(10)};
  ${OS === 'android'
    ? 'elevation: 4;'
    : 'shadow-color: rgba(0, 0, 0, 0.12); shadow-opacity: 1; shadow-radius: 4px; shadow-offset: 0px 4px;'}
`
export const MenuTextContainer = styled.View`
  display: flex;
  align-items: flex-start;
  flex: 1 0 0;
`

export const BackgroundMenuIcon = styled.View`
  display: flex;
  width: ${perfectSize(44)};
  height: ${perfectSize(44)};
  justify-content: center;
  align-items: center;
  background-color: ${props => props.theme.colors.BackgroundMenuIcon};
  border-radius: 1000px;
`

export const InsideMenuContainer = styled.View`
  display: flex;
  width: 93%;
  padding: 20px;
  align-items: flex-start;
  gap: ${perfectSize(12)};
  border-radius: 16px;
  background: ${props => props.theme.colors.MenuContainer};
  align-self: center;
  margin-top: ${perfectSize(10)};
  margin-bottom: ${perfectSize(10)};
  ${OS === 'android'
    ? 'elevation: 4;'
    : 'shadow-color: rgba(0, 0, 0, 0.12); shadow-opacity: 1; shadow-radius: 4px; shadow-offset: 0px 4px;'}
`

export const MenuInsideTextContainer = styled.View`
  display: flex;
  align-items: flex-start;
`

export const ButtonLinkContainer = styled.TouchableOpacity`
  width: 100%;
  display: flex;
  height: ${perfectSize(46)};
  padding: 0px 8px;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  border-radius: 12px;
  background: #fedd2c;
`

export const AppIconContainer = styled.View`
  display: flex;
  padding: 20px;
  align-items: center;
  gap: ${perfectSize(12)};
  border-radius: 16px;
  background: ${props => props.theme.colors.MenuContainer};
  align-self: center;
  margin-top: ${perfectSize(10)};
  margin-bottom: ${perfectSize(10)};
  ${OS === 'android'
    ? 'elevation: 4;'
    : 'shadow-color: rgba(0, 0, 0, 0.12); shadow-opacity: 1; shadow-radius: 4px; shadow-offset: 0px 4px;'}
`

export const LogoContainer = styled.Image`
  align-self: center;
  width: ${perfectSize(150)};
  height: ${perfectSize(150)};
  border-radius: 200px;
`

export const MenuTitleText = styled.Text`
  font-size: ${perfectSize(18)};
  font-style: normal;
  font-weight: 800;
  line-height: ${perfectSize(24)};
  color: ${props => props.theme.colors.titleMenuText};
`

export const MenuDescriptionText = styled.Text`
  font-size: ${perfectSize(13)};
  font-style: normal;
  font-weight: 400;
  line-height: ${perfectSize(20)};
  color: ${props => props.theme.colors.MenuDescriptionText};
  margin-top: ${perfectSize(5)};
`

export const ButtonLinkText = styled.Text`
  color: #303345;
  text-align: center;
  font-size: ${perfectSize(14)};
  font-style: normal;
  font-weight: 500;
  line-height: ${perfectSize(15)};
`
