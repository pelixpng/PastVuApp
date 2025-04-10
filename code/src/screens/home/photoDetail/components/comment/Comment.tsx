import { FC } from 'react'
import { DefaultTheme, useTheme } from 'styled-components'
import RenderHtml from 'react-native-render-html'
import { Image } from 'expo-image'
import StandardAvatar from '../../../../../../assets/avatar.png'
import { View } from 'react-native'
import { CommentAuthorName, CommentContainer, DateText, s } from './style'
import { IComment, Users } from '../../../../../types/apiPhotoComment'
import { formatDate } from '../../../../../utils/getTime'

type CommentProps = {
  comment: IComment
  users: Users | null
}

export const Comment: FC<CommentProps> = ({ users, comment }) => {
  const theme: DefaultTheme = useTheme()
  const textHTML = {
    html: `<span style="color: ${theme.colors.textSecond}; font-size: 13px; line-height: 20px; font-weight: 500;"> ${comment.txt} </span>`,
  }
  const date = formatDate(comment.stamp)
  const uri = users?.[comment.user]?.avatar
  return (
    <CommentContainer isParent={comment.parent}>
      <Image
        source={uri ? { uri: `https://pastvu.com${uri}` } : StandardAvatar}
        style={s.image}
        cachePolicy="disk"
      />
      <View style={s.CommentTextContainer}>
        <View style={s.row}>
          <CommentAuthorName>{comment.user}</CommentAuthorName>
          <DateText>{date}</DateText>
        </View>
        <RenderHtml source={textHTML} />
      </View>
    </CommentContainer>
  )
}
