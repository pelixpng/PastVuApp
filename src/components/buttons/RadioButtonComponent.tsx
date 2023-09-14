import React, { FC } from 'react'
import styled from 'styled-components/native'
import { perfectSize } from '../../utils/ScreenSize'
import { observer } from 'mobx-react-lite'
import ThemeStore from '../../mobx/ThemeStore'

export const RadioButtonComponent: FC = observer(() => {
	const { themeSettings, changeThemeSettings } = ThemeStore
	return (
		<GroupRadioButtonContainer>
			<RadioButtonContainer onPress={() => changeThemeSettings('Тёмная')}>
				{themeSettings == 'Тёмная' ? <ActiveButton /> : <NoActiveButton />}
				<LabelContainer>
					<LabelText>Тёмная</LabelText>
				</LabelContainer>
			</RadioButtonContainer>
			<Delimetr />
			<RadioButtonContainer onPress={() => changeThemeSettings('Светлая')}>
				{themeSettings == 'Светлая' ? <ActiveButton /> : <NoActiveButton />}
				<LabelContainer>
					<LabelText>Светлая</LabelText>
				</LabelContainer>
			</RadioButtonContainer>
			<Delimetr />
			<RadioButtonContainer onPress={() => changeThemeSettings('Системная')}>
				{themeSettings == 'Системная' ? <ActiveButton /> : <NoActiveButton />}
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
	background-color: ${props => props.theme.colors.Delimetr};
`

export const NoActiveButton = styled.View`
	display: flex;
	width: ${perfectSize(22)};
	height: ${perfectSize(22)};
	flex-direction: column;
	align-items: flex-start;
	gap: 10px;
	border-radius: 12px;
	background-color: #f4f4f4;
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

const ActiveButton = styled.View`
	width: ${perfectSize(22)};
	height: ${perfectSize(22)};
	border-radius: 12px;
	background-color: ${props => props.theme.colors.backgroundApp};
	border: 7px solid #6c86e2;
`
