import { FC } from 'react'
import styled from 'styled-components/native'
import { perfectSize } from '../../utils/ScreenSize'
import { MenuDescriptionText, MenuTitleText } from '../ui/UniversalComponents'
import { Alert, Platform, Share } from 'react-native'
import { MyButton } from '../buttons/MyButton'
import RenderHtml from 'react-native-render-html'
import { DefaultTheme, useTheme } from 'styled-components'
import * as MediaLibrary from 'expo-media-library'
import * as FileSystem from 'expo-file-system'

type PostInfoProps = {
  title: string
  years: string
  regions: Region[]
  cid: string
  author: string | null
  description: string
  source: string
  file: string
}

export const PostInfo: FC<PostInfoProps> = ({
  title,
  years,
  regions,
  cid,
  author,
  description,
  source,
  file,
}) => {
  const saveImage = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync(true)
      if (status === 'granted') {
        const localuri =
          Platform.OS === 'android'
            ? await FileSystem.downloadAsync(
                `https://pastvu.com/_p/a/${file}`,
                FileSystem.documentDirectory +
                  `${title?.substring(0, 15)}${file?.substring(file.indexOf('.'))}`,
              ).then(({ uri }) => {
                return uri
              })
            : `https://pastvu.com/_p/a/${file}`
        await MediaLibrary.saveToLibraryAsync(localuri)
        Alert.alert('Готово', 'Фотография успешно сохранена в галерею')
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось сохранить изображение')
    }
  }
  const theme: DefaultTheme = useTheme()
  const titlesRegion = regions?.map(region => region.title_local).join(', ')
  const authorHTML = {
    html: `<span style="color: ${theme.colors.MenuDescriptionText}; font-size: ${perfectSize(
      12,
    )}px; line-height: 
		${perfectSize(20)}
		; font-weight: 500; font-style: normal;"> Автор: ${author ? author : 'Неизвестен'} </span>`,
  }
  const descriptionHTML = {
    html: `<span style="color: ${theme.colors.MenuDescriptionText}; font-size: ${perfectSize(
      12,
    )}px; line-height: 
		${perfectSize(20)}
		; font-weight: 500; font-style: normal;"> Описание: ${
      description ? description : 'Отсутствует'
    } </span>`,
  }
  const sourceHTML = {
    html: `<span style="color: ${theme.colors.MenuDescriptionText}; font-size: ${perfectSize(
      12,
    )}px; line-height: 
		${perfectSize(20)}
		; font-weight: 500; font-style: normal;"> Источник: ${source ? source : 'Отсутствует'} </span>`,
  }

  return (
    <PostContainer>
      <TextContainer>
        <MenuTitleText>{title}</MenuTitleText>
        <MenuDescriptionText>{years + ', ' + titlesRegion}</MenuDescriptionText>
        <RenderHtml source={descriptionHTML} />
        <RenderHtml source={sourceHTML} />
        <RenderHtml source={authorHTML} />
      </TextContainer>
      <MyButton
        title={'Поделиться'}
        func={() =>
          Share.share({
            message: title + ': ' + 'https://pastvu.com/p/' + cid,
          })
        }
      />
      <MyButton title={'Скачать'} func={() => saveImage()} />
    </PostContainer>
  )
}

const PostContainer = styled.View`
  width: 100%;
  display: flex;
  align-items: flex-start;
  gap: ${perfectSize(12)};
  align-self: center;
  margin-top: ${perfectSize(10)};
  margin-bottom: ${perfectSize(10)};
`
const TextContainer = styled.View`
  display: flex;
  align-items: flex-start;
`
