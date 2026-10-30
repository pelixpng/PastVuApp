import { FC } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { observer } from 'mobx-react-lite'
import { useTheme } from '@react-navigation/native'
import RenderHTML from 'react-native-render-html'
import { Spacer } from '../ui/Spacer'
import { formatDate } from '../../utils/getTime'
import { t } from '../../i18n'
import { NearbyPhotos } from '../photo/NearbyPhotos'
import TranslationStore, { photoTranslationId } from '../../store/Translation.store'
import { GoogleAttribution } from '../translate/GoogleAttribution'

type PostTextProps = {
  postInfo: Photo
  onLinkPress?: (href: string) => void
  /** Opens another photo from the nearby ones; without it they are left out. */
  onOpenPhoto?: (cid: string) => void
}

/**
 * A photo's post under the photo, on the phone and the tablet alike: the title and place, the
 * description, author and source, the last edit, the nearby photos and the comments' heading.
 * An observer: the translation comes and goes without the list re-rendering.
 */
export const PostText: FC<PostTextProps> = observer(({ postInfo, onLinkPress, onOpenPhoto }) => {
  const { colors } = useTheme()
  // The title and description as translated from the header, in the order they were sent.
  const translationId = photoTranslationId(postInfo?.cid)
  const translation = TranslationStore.translation(translationId)
  // Each in the original when it was in the app's language already: it was sent empty, and an
  // empty text comes back empty.
  const title = translation?.[0] || postInfo?.title
  const desc = translation?.[1] || postInfo?.desc
  // Dimmed while the translation is on its way: the header button is greyed out, nothing spins.
  const fade = TranslationStore.state(translationId) === 'loading' && s.loading
  const commentTotal = postInfo?.ccount || 0
  const titlesRegion = postInfo?.regions?.map(region => region.title_local).join(', ')
  const locationText = postInfo?.y + ', ' + titlesRegion
  const descriptionHTML = { html: `<p>${desc}</p>` }
  const sourceHTML = {
    html: `<p><strong>${t('photo.source')}:</strong> <span>${postInfo?.source || t('photo.sourceMissing')}</span></p>`,
  }
  const authorHTML = {
    html: `<p><strong>${t('photo.author')}:</strong> <span>${postInfo?.author || t('photo.authorUnknown')}</span></p>`,
  }
  const lastEditFormat = formatDate(postInfo?.cdate)
  return (
    <View>
      <Text selectable style={[s.postTitleText, { color: colors.textFirst }, fade]}>
        {title}
      </Text>
      <Spacer height={4} />
      <Text selectable style={[s.postLocationText, { color: colors.textSecond }]}>
        {locationText}
      </Text>
      <Spacer height={8} />
      {!!desc && (
        <View style={fade}>
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
                color: colors.basePrimary,
                textDecorationLine: 'underline',
              },
            }}
            renderersProps={{
              a: { onPress: (_, href) => onLinkPress?.(href) },
            }}
          />
        </View>
      )}
      {/* Google's terms want its badge beside every translation it makes. */}
      {translation && <GoogleAttribution />}
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
            color: colors.basePrimary,
            textDecorationLine: 'underline',
          },
        }}
        renderersProps={{
          a: { onPress: (_, href) => onLinkPress?.(href) },
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
            color: colors.basePrimary,
            textDecorationLine: 'underline',
          },
        }}
        renderersProps={{
          a: { onPress: (_, href) => onLinkPress?.(href) },
        }}
      />
      <Spacer height={8} />
      {lastEditFormat && (
        <Text selectable style={[s.postLocationText, { color: colors.textThird }]}>
          {t('photo.lastModified')} {lastEditFormat}
        </Text>
      )}
      <Spacer height={12} />
      {onOpenPhoto && (
        <NearbyPhotos
          cid={String(postInfo.cid)}
          geo={postInfo.geo}
          onOpen={onOpenPhoto}
          // The list's side padding, the phone screen's or the tablet panel's: the row runs out to
          // the edges, its first photo under the text.
          inset={16}
        />
      )}
      <View style={s.row}>
        <Text style={[s.commentHeaderText, { color: colors.textFirst }]}>{t('photo.comments')} </Text>
        <Text style={[s.commentHeaderText, { color: colors.textThird }]}>{commentTotal}</Text>
      </View>
      <Spacer height={12} />
    </View>
  )
})

const s = StyleSheet.create({
  commentHeaderText: {
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 28,
  },
  postTitleText: {
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 24,
  },
  postLocationText: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 20,
  },
  row: {
    flexDirection: 'row',
  },
  loading: { opacity: 0.5 },
})
