import React, { FC } from 'react'
import styled from 'styled-components/native'
import { perfectSize } from '../../utils/ScreenSize'
import { MenuDescriptionText, MenuTitleText } from '../ui/UniversalComponents'
import { Share } from 'react-native'
import { MyButton } from '../buttons/MyButton'
import RenderHtml from 'react-native-render-html'
import { DefaultTheme, useTheme } from 'styled-components'

type PostInfoProps = {
	title: string
	years: string
	regions: Region[]
	cid: number
	author: string | null
	description: string
	source: string
}

export const PostInfo: FC<PostInfoProps> = ({
	title,
	years,
	regions,
	cid,
	author,
	description,
	source
}) => {
	const theme: DefaultTheme = useTheme()
	const titlesRegion = regions.map(region => region.title_local).join(', ')
	const authorHTML = {
		html: `<span style="color: ${
			theme.colors.MenuDescriptionText
		}; font-size: 13px; line-height: ${perfectSize(
			20
		)}; font-weight: 500; font-style: normal;"> Автор: ${
			author ? author : 'Неизвестен'
		} </span>`
	}
	const descriptionHTML = {
		html: `<span style="color: ${
			theme.colors.MenuDescriptionText
		}; font-size: 13px; line-height: ${perfectSize(
			20
		)}; font-weight: 500; font-style: normal;"> Описание: ${
			description ? description : 'Отсутствует'
		} </span>`
	}
	const sourceHTML = {
		html: `<span style="color: ${
			theme.colors.MenuDescriptionText
		}; font-size: 13px; line-height: ${perfectSize(
			20
		)}; font-weight: 500; font-style: normal;"> Источник: ${
			source ? source : 'Отсутствует'
		} </span>`
	}
	return (
		<PostContainer>
			<TextContainer>
				<MenuTitleText>{title}</MenuTitleText>
				<MenuDescriptionText>{years + ', ' + titlesRegion}</MenuDescriptionText>
				<RenderHtml source={descriptionHTML} />
				<RenderHtml source={sourceHTML} />
				<RenderHtml source={authorHTML} />
			</TextContainer>
			<MyButton
				title={'Поделиться'}
				func={() =>
					Share.share({
						message: title + ': ' + 'https://pastvu.com/p/' + cid
					})
				}
			/>
		</PostContainer>
	)
}

const PostContainer = styled.View`
	flex-direction: column;
	display: flex;
	width: 93%;
	align-items: flex-start;
	gap: 12px;
	align-self: center;
	margin-top: 10px;
	margin-bottom: 10px;
`
const TextContainer = styled.View`
	display: flex;
	flex-direction: column;
	align-items: flex-start;
`
