import { FC } from 'react'
import { View } from 'react-native'
import RenderHtml from 'react-native-render-html'
import { DefaultTheme, useTheme } from 'styled-components'
import { MaterialIcons } from '@expo/vector-icons'
import { CommentHeader, LastEditText, PostLocationText, PostTitleText, s } from './style'
import { formatDate } from '../../../../../utils/getTime'
import { MyButton } from '../../../../../components/ui/buttons/MyButton'

type PostInfoProps = {
  postInfo: Photo
  saveImage: () => void
}

export const PostInfo: FC<PostInfoProps> = ({ postInfo, saveImage }) => {
  const theme: DefaultTheme = useTheme()
  const commentTotal = postInfo.ccount || 0
  const titlesRegion = postInfo.regions?.map(region => region.title_local).join(', ')
  const locationText = postInfo.y + ', ' + titlesRegion
  const createHTML = (text?: string, title?: string) => ({
    html: `
    ${
      title
        ? `<span style="font-size: 13px; font-weight: 800; line-height: 20; color: ${theme.colors.textSecond};">${title}:</span>`
        : ''
    }
      <span style="color: ${
        title ? theme.colors.textSecond : theme.colors.textFirst
      }; font-size: 13px; line-height: 20; font-weight: 500;">
        ${text}
      </span>
    `,
  })
  const descriptionHTML = createHTML(postInfo.desc)
  const sourceHTML = createHTML(postInfo.source || 'Отсутствует', 'Источник')
  const authorHTML = createHTML(postInfo.author || 'Неизвестен', 'Автор')
  const lastEditFormat = formatDate(postInfo.cdate)
  return (
    <View>
      <PostTitleText>{postInfo.title}</PostTitleText>
      <View style={s.texts}>
        <PostLocationText>{locationText}</PostLocationText>
        {postInfo.desc && <RenderHtml source={descriptionHTML} />}
        <View>
          <RenderHtml source={authorHTML} />
          <RenderHtml source={sourceHTML} />
        </View>
        {lastEditFormat && <LastEditText>Последнее изменение {lastEditFormat}</LastEditText>}
      </View>
      <MyButton
        title={'Скачать изображение'}
        children={<MaterialIcons name={'save-alt'} size={24} color={'white'} />}
        func={saveImage}
      />
      <View style={s.block}>
        <CommentHeader>Комментарии </CommentHeader>
        <CommentHeader count>{commentTotal}</CommentHeader>
      </View>
    </View>
  )
}
