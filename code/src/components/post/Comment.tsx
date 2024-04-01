import React, { FC } from 'react'
import styled from 'styled-components/native'
import { perfectSize } from '../../utils/ScreenSize'
import { DefaultTheme, useTheme } from 'styled-components'
import RenderHtml from 'react-native-render-html'
import { Image } from 'expo-image'
import StandardAvatar from '../../../assets/avatar.png'
import { StyleSheet } from 'react-native'

type CommentProps = {
  uri?: string
  name: string
  text: string
  width: string
  stamp: number
}

export const Comment: FC<CommentProps> = ({ name, text, uri, width, stamp }) => {
  const theme: DefaultTheme = useTheme()
  const textHTML = {
    html: `<span style="color: ${theme.colors.MenuDescriptionText}; font-size: ${perfectSize(
      12,
    )}px; line-height: 
		${perfectSize(18)}px;
		; font-weight: 400; font-style: normal;"> ${text} </span>`,
  }
  const date = ` - ${new Date(stamp).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })}`
  return (
    <CommentContainer width={width}>
      <Image
        source={uri ? { uri: `https://pastvu.com${uri}` } : StandardAvatar}
        style={s.image}
        cachePolicy="disk"
      />
      <CommentTextContainer>
        <NameDateContainer>
          <CommentAuthorName>{name}</CommentAuthorName>
          <DateText>{date}</DateText>
        </NameDateContainer>
        <RenderHtml source={textHTML} />
      </CommentTextContainer>
    </CommentContainer>
  )
}

const NameDateContainer = styled.View`
  flex-direction: row;
`

const CommentContainer = styled.View<{ width: string }>`
  flex-direction: row;
  align-items: center;
  margin-bottom: ${perfectSize(10)};
  align-self: center;
  margin-left: auto;
  width: ${props => props.width};
`

const CommentTextContainer = styled.View`
  flex: 1;
  margin-left: ${perfectSize(10)};
  margin-bottom: auto;
`

const CommentAuthorName = styled.Text`
  font-weight: bold;
  font-size: ${perfectSize(12)};
  line-height: ${perfectSize(12)};
  color: ${props => props.theme.colors.titleMenuText};
`
const DateText = styled.Text`
  color: ${props => props.theme.colors.MenuDescriptionText};
  font-size: ${perfectSize(12)};
  line-height: ${perfectSize(12)};
  font-weight: 400;
`

const s = StyleSheet.create({
  image: {
    width: perfectSize(40),
    height: perfectSize(40),
    borderRadius: 40,
    marginBottom: 'auto',
  },
})
