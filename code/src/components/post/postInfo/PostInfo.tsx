import { FC } from 'react'
import { Alert, Platform, View } from 'react-native'
import RenderHtml from 'react-native-render-html'
import { DefaultTheme, useTheme } from 'styled-components'
import * as MediaLibrary from 'expo-media-library'
import * as FileSystem from 'expo-file-system'
import { MyButton } from '../../ui/buttons/MyButton'
import { MaterialIcons } from '@expo/vector-icons'
import { formatDate } from '../../../utils/getTime'
import { CommentHeader, LastEditText, PostLocationText, PostTitleText, s } from './style'

type PostInfoProps = {
  title: string
  years: string
  regions: Region[]
  author: string | null
  description: string
  source: string
  file: string
  lastEdit?: string
  commentsCount?: number
}

export const PostInfo: FC<PostInfoProps> = ({
  title,
  years,
  regions,
  author,
  description,
  source,
  file,
  lastEdit,
  commentsCount,
}) => {
  const commentTotal = commentsCount || 0
  const saveImage = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync(true)
      if (status !== 'granted') {
        Alert.alert('Ошибка', 'Нет разрешения на сохранение изображений')
        return
      }
      const fileUri = `https://pastvu.com/_p/a/${file}`
      let localUri = fileUri
      if (Platform.OS === 'android') {
        const fileName = `${title?.substring(0, 15)}${file?.substring(file.indexOf('.'))}`
        const downloadResult = await FileSystem.downloadAsync(
          fileUri,
          FileSystem.documentDirectory + fileName,
        )
        localUri = downloadResult.uri
      }
      await MediaLibrary.saveToLibraryAsync(localUri)
      Alert.alert('Готово', 'Фотография успешно сохранена в галерею')
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось сохранить изображение')
    }
  }
  const theme: DefaultTheme = useTheme()
  const titlesRegion = regions?.map(region => region.title_local).join(', ')
  const locationText = years + ', ' + titlesRegion
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
  const descriptionHTML = createHTML(description)
  const sourceHTML = createHTML(source || 'Отсутствует', 'Источник')
  const authorHTML = createHTML(author || 'Неизвестен', 'Автор')
  const lastEditFormat = formatDate(lastEdit)
  return (
    <View>
      <PostTitleText>{title}</PostTitleText>
      <View style={s.texts}>
        <PostLocationText>{locationText}</PostLocationText>
        {description && <RenderHtml source={descriptionHTML} />}
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
