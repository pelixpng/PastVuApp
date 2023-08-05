import React, { useEffect, useState } from 'react'
import {
	View,
	Image,
	StyleSheet,
	Text,
	ScrollView,
	Linking
} from 'react-native'
import { MapScreenNavigationProp, Propss } from '../types/Navigation.types'
import {
	ButtonLinkContainer,
	MenuDescriptionText,
	MenuInsideTextContainer,
	MenuTitleText,
	ScrollContainer,
	ViewContainer
} from '../components/UniversalComponents'
import styled from 'styled-components/native'
import { InsideMenuComponent } from '../components/InsideMenuComponent'
import { Root } from '../types/apiPhotoInfo'
import { perfectSize } from '../utils/ScreenSize'
import { ButtonLink } from '../components/ButtonLink'
import { ShareButton } from '../components/ShareButton'
import { TextProps } from 'react-native'
import RenderHtml from 'react-native-render-html'
import { DefaultTheme, useTheme } from 'styled-components'
import { PhotoPageProps } from '../types/components.types'

export const PhotoPage: React.FC<PhotoPageProps> = ({ route }) => {
	const {
		PhotoJson: {
			result: {
				photo: {
					file,
					title,
					y: years,
					regions,
					cid,
					author,
					desc: description,
					source: sourse
				}
			}
		}
	} = route.params
	const theme: DefaultTheme = useTheme()
	const imageUri: string = `https://pastvu.com/_p/d/${file}`
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
			sourse ? sourse : 'Отсутствует'
		} </span>`
	}

	return (
		<ViewContainer>
			<Photo source={{ uri: imageUri }} resizeMode="contain" />
			<ScrollContainer>
				<InsideMenuComponent
					title={title}
					discription={years + ', ' + titlesRegion}
					HTMLdiscription={<RenderHtml source={descriptionHTML} />}
					HTMLsource={<RenderHtml source={sourceHTML} />}
					HTMLautor={<RenderHtml source={authorHTML} />}
					button={
						<ShareButton
							title={'Поделиться'}
							url={'https://pastvu.com/p/' + cid}
						/>
					}
				/>
			</ScrollContainer>
		</ViewContainer>
	)
}

const Photo = styled.Image`
	width: 100%;
	height: 40%;
	background-color: ${props => props.theme.colors.backgroundApp};
`
