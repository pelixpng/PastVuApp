import React, { FC } from 'react'
import styled from 'styled-components/native'
import { MaterialIcons } from '@expo/vector-icons'
import { DefaultTheme, useTheme } from 'styled-components'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { RootStackParamList } from '../../types/navigation'
import { perfectSize } from '../../utils/ScreenSize'

const GetHistoryButton: FC = () => {
	const theme: DefaultTheme = useTheme()
	const navigation = useNavigation<NavigationProp<RootStackParamList>>()
	return (
		<ContainerIcon onPress={() => navigation.navigate('History')}>
			<MaterialIcons
				name="history"
				size={24}
				color={theme.colors.titleMenuText}
			/>
		</ContainerIcon>
	)
}

export const HistoryButton = React.memo(GetHistoryButton)

const ContainerIcon = styled.TouchableOpacity`
	background-color: ${props => props.theme.colors.backgroundApp};
	align-self: flex-end;
	padding: 10px;
	border-radius: 50px;
	position: absolute;
	bottom: ${perfectSize(210)};
	right: ${perfectSize(10)};
`
