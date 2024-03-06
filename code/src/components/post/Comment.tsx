import React, { FC } from 'react'
import styled from 'styled-components/native'
import { perfectSize } from '../../utils/ScreenSize'
import { DefaultTheme, useTheme } from 'styled-components'
import RenderHtml from 'react-native-render-html'
import { Image } from 'expo-image'
import StandardAvatar from '../../../assets/avatar.png'
import moment from 'moment'

type CommentProps = {
	uri?: string
	name: string
	text: string
	width: string
	stamp: number
}

export const Comment: FC<CommentProps> = ({
	name,
	text,
	uri,
	width,
	stamp
}) => {
	const theme: DefaultTheme = useTheme()
	const textHTML = {
		html: `<span style="color: ${
			theme.colors.MenuDescriptionText
		}; font-size: ${perfectSize(13)}px; line-height: 
		${perfectSize(18)}px;
		; font-weight: 400; font-style: normal;"> ${text} </span>`
	}
	const date = ` - ${moment(stamp).format('DD.MM.YYYY, HH:mm')}`
	return (
		<CommentContainer width={width}>
			<Image
				source={uri ? { uri: `https://pastvu.com${uri}` } : StandardAvatar}
				style={{
					width: perfectSize(40),
					height: perfectSize(40),
					borderRadius: 40,
					marginBottom: 'auto'
				}}
				cachePolicy="disk"
			/>
			<CommentTextContainer>
				<NameDateContainer>
					<CommentAuthorName>{name}</CommentAuthorName>
					<DateText>{date}</DateText>
				</NameDateContainer>
				<RenderHtml source={textHTML} />
			</CommentTextContainer>
		</CommentContainer>
	)
}

const NameDateContainer = styled.View`
	flex-direction: row;
`

const CommentContainer = styled.View<{ width: string }>`
	flex-direction: row;
	align-items: center;
	margin-bottom: ${perfectSize(10)};
	align-self: center;
	margin-left: auto;
	width: ${props => props.width};
`

const CommentTextContainer = styled.View`
	flex: 1;
	margin-left: ${perfectSize(10)};
	margin-bottom: auto;
`

const CommentAuthorName = styled.Text`
	font-weight: bold;
	font-size: ${perfectSize(13)};
	line-height: ${perfectSize(13)};
	color: ${props => props.theme.colors.titleMenuText};
`
const DateText = styled.Text`
	color: ${props => props.theme.colors.MenuDescriptionText};
	font-size: ${perfectSize(13)};
	line-height: ${perfectSize(13)};
	font-weight: 400;
`
