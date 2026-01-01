import { FC } from 'react'
import { View, Text } from 'react-native'
import { s } from './style'
import { useTheme } from '@react-navigation/native'
import RenderHTML from 'react-native-render-html'
import { Spacer } from '../../../../../../core/components/ui/Spacer'
import { formatDate } from '../../../../../../core/utils/getTime'

type PostInfoProps = {
  postInfo: Photo
}

export const PostInfo: FC<PostInfoProps> = ({ postInfo }) => {
  const { colors } = useTheme()
  const commentTotal = postInfo.ccount || 0
  const titlesRegion = postInfo.regions?.map(region => region.title_local).join(', ')
  const locationText = postInfo.y + ', ' + titlesRegion
  const descriptionHTML = { html: `<p>${postInfo.desc}</p>` }
  const sourceHTML = {
    html: `<p><strong>Источник:</strong> <span>${postInfo.source || 'Отсутствует'}</span></p>`,
  }
  const authorHTML = {
    html: `<p><strong>Автор:</strong> <span>${postInfo.author || 'Неизвестен'}</span></p>`,
  }
  const lastEditFormat = formatDate(postInfo.cdate)
  return (
    <View>
      <Text selectable style={[s.postTitleText, { color: colors.textFirst }]}>
        {postInfo.title}
      </Text>
      <Spacer height={4} />
      <Text selectable style={[s.postLocationText, { color: colors.textSecond }]}>
        {locationText}
      </Text>
      <Spacer height={8} />
      {postInfo.desc && (
        <RenderHTML
          source={descriptionHTML}
          baseStyle={{
            color: colors.textFirst,
            fontSize: 13,
            lineHeight: 20,
            fontWeight: '500',
          }}
          tagsStyles={{
            a: {
              color: colors.primary,
              textDecorationLine: 'underline',
            },
          }}
        />
      )}
      <Spacer height={8} />
      <RenderHTML
        source={authorHTML}
        tagsStyles={{
          strong: {
            color: colors.textSecond,
            fontSize: 13,
            lineHeight: 20,
            fontWeight: '900',
          },
          span: {
            color: colors.textSecond,
            fontSize: 13,
            lineHeight: 20,
            fontWeight: '500',
          },
          a: {
            color: colors.primary,
            textDecorationLine: 'underline',
          },
        }}
      />
      <RenderHTML
        source={sourceHTML}
        tagsStyles={{
          strong: {
            color: colors.textSecond,
            fontSize: 13,
            lineHeight: 20,
            fontWeight: '900',
          },
          span: {
            color: colors.textSecond,
            fontSize: 13,
            lineHeight: 20,
            fontWeight: '500',
          },
          a: {
            color: colors.primary,
            textDecorationLine: 'underline',
          },
        }}
      />
      <Spacer height={8} />
      {lastEditFormat && (
        <Text selectable style={[s.postLocationText, { color: colors.textThird }]}>
          Последнее изменение {lastEditFormat}
        </Text>
      )}
      <Spacer height={12} />
      <View style={s.row}>
        <Text style={[s.commentHeaderText, { color: colors.textFirst }]}>Комментарии </Text>
        <Text style={[s.commentHeaderText, { color: colors.textThird }]}>{commentTotal}</Text>
      </View>
      <Spacer height={12} />
    </View>
  )
}
