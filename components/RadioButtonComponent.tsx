import { FC, useState } from 'react'
import { Text, View } from 'react-native'
import styled from 'styled-components/native';
import { perfectSize } from '../utils/ScreenSize';
import { DefaultTheme } from 'styled-components/dist/types';
import { observer } from 'mobx-react-lite';
import apiStore from '../mobxStore/apiStore';


// type RadioButtonComponentProps = {
//     themeSettings: string;
//     setthemeSettings: (value: string) => void;
// }


const ActiveButtonContainer: FC = () => {
    return(
        <ActiveButton>
            <CenterActiveButton/>
        </ActiveButton>
    )
}

export const RadioButtonComponent: FC = observer(() => {
const { themeSettings, changeThemeSettings} = apiStore;
  return (
    <GroupRadioButtonContainer>
        <RadioButtonContainer onPress={() => changeThemeSettings("Тёмная")}>
            {themeSettings=='Тёмная' ? <ActiveButtonContainer/> : <NoActiveButton/>}
            <LabelContainer>
                <LabelText>Тёмная</LabelText>
            </LabelContainer>
        </RadioButtonContainer>
        <Delimetr/>
        <RadioButtonContainer onPress={() => changeThemeSettings("Светлая")}>
            {themeSettings=='Светлая' ? <ActiveButtonContainer/> : <NoActiveButton/>}
            <LabelContainer>
                <LabelText>Светлая</LabelText>
            </LabelContainer>
        </RadioButtonContainer>
        <Delimetr/>
        <RadioButtonContainer onPress={() => changeThemeSettings("Системная")}>
            {themeSettings=='Системная' ? <ActiveButtonContainer/> : <NoActiveButton/>}
            <LabelContainer>
                <LabelText>Системная</LabelText>
            </LabelContainer>
        </RadioButtonContainer>
    </GroupRadioButtonContainer>
  )
})

export const GroupRadioButtonContainer = styled.View`
    display: flex;
    width: 100%;
    height: auto;
    flex-direction: column;
    align-items: flex-start;
    flex-shrink: 0;
    background-color: ${props => props.theme.colors.MenuContainer};
`

export const RadioButtonContainer = styled.TouchableOpacity`
    display: flex;
    padding-top: 10;
    padding-bottom: 10;
    align-items: flex-start;
    gap: 12px;
    align-self: stretch;
    flex-direction: row;
    background-color: ${props => props.theme.colors.MenuContainer};
`
export const Delimetr = styled.View`
    height: 1px;
    width: 100%;
    background-color: #F4F4F4;
`

export const NoActiveButton = styled.View`
    display: flex;
    width: ${perfectSize(22)};
    height: ${perfectSize(22)};
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    border-radius: 12px;
    background-color: #F4F4F4;

`
export const LabelContainer = styled.View`
    display: flex;
    align-items: center;
    gap: 4px;
    background-color: ${props => props.theme.colors.backgroundApp};
`
export const LabelText = styled.Text`
    font-size: ${perfectSize(15)};
    font-style: normal;
    font-weight: 500;
    line-height: 24px;
    color: ${props => props.theme.colors.titleMenuText};
    background-color: ${props => props.theme.colors.MenuContainer};
`

export const ActiveButton = styled.View`
    padding: 6px;
    align-items: flex-start;
    gap: 10px;
    background-color: #6C86E2;
    border-radius: 20px;
`

export const CenterActiveButton = styled.View`
    width: ${perfectSize(10)};
    height: ${perfectSize(10)};
    border-radius: 20px;
    background-color: ${props => props.theme.colors.backgroundApp};
`