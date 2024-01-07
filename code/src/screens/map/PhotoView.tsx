import React from 'react'
import {
	ScrollContainer,
	ViewContainer
} from '../../components/ui/UniversalComponents'
import styled from 'styled-components/native'
import { PostInfo } from '../../components/post/PostInfo'
import { CommentList } from '../../components/post/CommentList'
import { observer } from 'mobx-react-lite'
import PhotoQualitySettings from '../../mobx/PhotoSettingsStore'
import Pinchable from 'react-native-pinchable'

type PhotoPageProps = {
	route: { params: { PhotoJson: PhotoInfo } }
}

export const PhotoPage: React.FC<PhotoPageProps> = observer(({ route }) => {
	const { photoQualitySettings } = PhotoQualitySettings
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
	return (
		<ViewContainer>
			<Pinchable style={{ width: '100%', height: '40%' }}>
				<Photo
					source={{
						uri: `https://pastvu.com/_p/${photoQualitySettings}/${file}`
					}}
					resizeMode="contain"
				/>
			</Pinchable>
			<ScrollContainer>
				<PostInfo
					title={title}
					years={years}
					regions={regions}
					cid={cid}
					author={author}
					description={description}
					source={sourse}
					file={file}
				/>
				<CommentList cid={cid.toString()} />
			</ScrollContainer>
		</ViewContainer>
	)
})

const Photo = styled.Image`
	width: 100%;
	height: 100%;
	background-color: ${props => props.theme.colors.backgroundApp};
`
