import React, { FC, useEffect, useState } from 'react'
import styled from 'styled-components/native'
import { Comment } from './Comment'
import ApiService from '../../api/PastVuApi'
import { IComment, Users } from '../../types/apiPhotoComment'
import AlertModalService from '../../utils/AlertModalService'
import { perfectSize } from '../../utils/ScreenSize'

type CommentListProps = {
	cid: string
}

export const CommentList: FC<CommentListProps> = ({ cid }) => {
	const [comments, setComments] = useState<IComment[]>()
	const [users, setUsers] = useState<Users>()

	useEffect(() => {
		const getComments = async () => {
			try {
				const json = await ApiService.getComments(cid)
				const arr = json.result.comments
				let tmp: IComment[] = []
				function printComments(comments: IComment[]) {
					for (let comment of comments) {
						tmp.push(comment)
						if (comment.comments) {
							printComments(comment.comments)
						}
					}
				}
				printComments(arr)
				setComments(tmp)
				setUsers(json.result.users)
			} catch (error) {
				AlertModalService.internetError()
			}
		}
		getComments()
	}, [])

	return (
		<Container>
			{comments &&
				comments.map((item, index) => (
					<Comment
						uri={users && users[item.user].avatar}
						name={item.user}
						text={item.txt}
						width={item.parent ? '88%' : '100%'}
						key={index}
					/>
				))}
		</Container>
	)
}

const Container = styled.View`
	align-self: center;
	width: 93%;
	margin-top: ${perfectSize(2)};
`
