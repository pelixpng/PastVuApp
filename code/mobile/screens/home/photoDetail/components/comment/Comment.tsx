import { FC } from 'react'
import { Image } from 'expo-image'
import { View, Text } from 'react-native'
import StandardAvatar from '../../../../../../assets/avatar.png'
import { useTheme } from '@react-navigation/native'
import RenderHTML from 'react-native-render-html'
import { Spacer } from '../../../../../../core/components/ui/Spacer'
import { s } from './style'
import { IComment, Users } from '../../../../../../core/types/apiPhotoComment'
import { formatDate } from '../../../../../../core/utils/getTime'

type CommentProps = {
  comment: IComment
  users: Users | null
}

export const Comment: FC<CommentProps> = ({ users, comment }) => {
  const { colors } = useTheme()
  const commentHtml = { html: `<p>${comment.txt}</p>` }
  const date = formatDate(comment.stamp)
  const uri = users?.[comment.user]?.avatar
  return (
    <View style={[s.commentContainer, comment.parent ? s.width88 : s.width100]}>
      <Image
        source={uri ? { uri: `https://pastvu.com${uri}` } : StandardAvatar}
        style={s.image}
        cachePolicy="disk"
      />
      <Spacer width={8} />
      <View style={s.commentTextContainer}>
        <Text selectable style={s.row}>
          <Text style={[s.nameText, { color: colors.textFirst }]}>{comment.user}</Text>
          <Spacer width={5} />
          <Text style={[s.dateText, { color: colors.textThird }]}>{date}</Text>
        </Text>
        <RenderHTML
          source={commentHtml}
          baseStyle={{
            fontSize: 13,
            lineHeight: 20,
            color: colors.textSecond,
          }}
          tagsStyles={{
            a: {
              color: colors.primary,
              textDecorationLine: 'underline',
            },
          }}
        />
      </View>
    </View>
  )
}
