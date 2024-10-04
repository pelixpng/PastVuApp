import { FC } from 'react'
import { DefaultTheme, useTheme } from 'styled-components'
import RenderHtml from 'react-native-render-html'
import { Image } from 'expo-image'
import StandardAvatar from '../../../../assets/avatar.png'
import { View } from 'react-native'
import { CommentAuthorName, CommentContainer, DateText, s } from './style'
import { formatDate } from '../../../utils/getTime'

type CommentProps = {
  uri?: string
  name: string
  text: string
  isParent?: number
  stamp: number
}

export const Comment: FC<CommentProps> = ({ name, text, uri, isParent, stamp }) => {
  const theme: DefaultTheme = useTheme()
  const textHTML = {
    html: `<span style="color: ${theme.colors.textSecond}; font-size: 13px; line-height: 20px; font-weight: 500;"> ${text} </span>`,
  }
  const date = formatDate(stamp)
  return (
    <CommentContainer isParent={isParent}>
      <Image
        source={uri ? { uri: `https://pastvu.com${uri}` } : StandardAvatar}
        style={s.image}
        cachePolicy="disk"
      />
      <View style={s.CommentTextContainer}>
        <View style={s.row}>
          <CommentAuthorName>{name}</CommentAuthorName>
          <DateText>{date}</DateText>
        </View>
        <RenderHtml source={textHTML} />
      </View>
    </CommentContainer>
  )
}
