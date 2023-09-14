import React from 'react'
import {
	ScrollContainer,
	ViewContainer
} from '../../components/ui/UniversalComponents'
import styled from 'styled-components/native'
import { PostInfo } from '../../components/post/PostInfo'
import { CommentList } from '../../components/post/CommentList'

type PhotoPageProps = {
	route: { params: { PhotoJson: PhotoInfo } }
}

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

	const imageUri: string = `https://pastvu.com/_p/d/${file}`

	return (
		<ViewContainer>
			<Photo source={{ uri: imageUri }} resizeMode="contain" />
			<ScrollContainer>
				<PostInfo
					title={title}
					years={years}
					regions={regions}
					cid={cid}
					author={author}
					description={description}
					source={sourse}
				/>
				<CommentList cid={cid.toString()} />
			</ScrollContainer>
		</ViewContainer>
	)
}

const Photo = styled.Image`
	width: 100%;
	height: 40%;
	background-color: ${props => props.theme.colors.backgroundApp};
`
