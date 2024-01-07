import React, { FC } from 'react'
import styled from 'styled-components/native'
import { perfectSize } from '../../utils/ScreenSize'
import { DefaultTheme, useTheme } from 'styled-components'
import RenderHtml from 'react-native-render-html'

type CommentProps = {
	uri: string | undefined
	name: string
	text: string
	width: string
}

export const Comment: FC<CommentProps> = ({ name, text, uri, width }) => {
	const theme: DefaultTheme = useTheme()
	const textHTML = {
		html: `<span style="color: ${
			theme.colors.MenuDescriptionText
		}; font-size: ${perfectSize(13)}px; line-height: 
		${perfectSize(18)}px;
		; font-weight: 400; font-style: normal;"> ${text} </span>`
	}

	return (
		<CommentContainer width={width}>
			<CommentAuthorImage
				source={{
					uri: `https://pastvu.com${uri ? uri : '/img/caps/avatar.png'}`
				}}
			/>
			<CommentTextContainer>
				<CommentAuthorName>{name}</CommentAuthorName>
				<RenderHtml source={textHTML} />
			</CommentTextContainer>
		</CommentContainer>
	)
}

type CommentType = { width: string }

const CommentContainer = styled.View<CommentType>`
	flex-direction: row;
	align-items: center;
	margin-bottom: ${perfectSize(10)};
	align-self: center;
	margin-left: auto;
	width: ${props => props.width};
`

const CommentAuthorImage = styled.Image`
	width: ${perfectSize(40)};
	height: ${perfectSize(40)};
	border-radius: 30px;
	margin-bottom: auto;
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
