import React from 'react'
import {
	ScrollContainer,
	ViewContainer
} from '../../components/ui/UniversalComponents'
import { PostInfo } from '../../components/post/PostInfo'
import { CommentList } from '../../components/post/CommentList'
import { observer } from 'mobx-react-lite'
import PhotoQualitySettings from '../../mobx/PhotoSettingsStore'
import Pinchable from 'react-native-pinchable'
import AlertModalService from '../../utils/AlertModalService'
import { Image } from 'expo-image'

export type PhotoPageProps = {
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
				<Image
					source={{
						uri: `https://pastvu.com/_p/${photoQualitySettings}/${file}`
					}}
					style={{ width: '100%', height: '100%' }}
					contentFit="contain"
					allowDownscaling={false}
					onError={() =>
						AlertModalService.infoAlert(
							'Ошибка',
							'Не удалось загрузить изображение, попробуйте позже'
						)
					}
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
