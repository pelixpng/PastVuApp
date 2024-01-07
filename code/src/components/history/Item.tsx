import React, { FC } from 'react'
import styled from 'styled-components/native'
import ApiService from '../../api/PastVuApi'
import { HistoryItem } from '../../storage/Storage'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { RootStackParamList } from '../../types/navigation'
import { perfectSize } from '../../utils/ScreenSize'

export const ItemHistory: FC<HistoryItem> = ({
	title,
	description,
	cid,
	file
}) => {
	const navigation = useNavigation<NavigationProp<RootStackParamList>>()
	const handleButtonPress = async (cid: string) => {
		const PhotoJson: PhotoInfo = await ApiService.getPhotoInfo(cid)
		navigation.navigate('PhotoPage', { PhotoJson })
	}
	return (
		<MainContainer onPress={() => handleButtonPress(cid)}>
			<Photo source={{ uri: `https://pastvu.com/_p/d/${file}` }} />
			<InfoContainer>
				<TitleText>{title}</TitleText>
				<DescriptionText>{description}</DescriptionText>
			</InfoContainer>
		</MainContainer>
	)
}

export const TitleText = styled.Text`
	font-weight: bold;
	font-size: ${perfectSize(14)};
	line-height: ${perfectSize(14)};
	color: ${props => props.theme.colors.titleMenuText};
`

export const DescriptionText = styled.Text`
	margin-top: ${perfectSize(5)};
	font-style: normal;
	font-weight: 400;
	font-size: ${perfectSize(13)};
	line-height: ${perfectSize(13)};
	color: ${props => props.theme.colors.titleMenuText};
`

const InfoContainer = styled.View`
	flex: 1;
	margin-left: ${perfectSize(10)};
	margin-bottom: auto;
`

const MainContainer = styled.TouchableOpacity`
	flex-direction: row;
	align-items: center;
	align-self: center;
	padding-bottom: ${perfectSize(10)};
`

const Photo = styled.Image`
	width: 25%;
	height: ${perfectSize(80)};
	border-radius: 20px;
`
