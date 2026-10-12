import { FC, useState } from 'react'
import { View, Text } from 'react-native'
import { observer } from 'mobx-react-lite'
import { s } from './style'
import { useTheme } from '@react-navigation/native'
import RenderHTML from 'react-native-render-html'
import { formatDate } from '../../../../../core/utils/getTime'
import { Spacer } from '../../../../../core/components/ui/Spacer'
import { ImageZoom } from '../../../../../core/components/photo/ImageZoom'
import { ColourReveal } from '../../../../../core/components/colorize/ColourReveal'
import { PostColorize } from '../../../../../core/store/PostColorize'
import { photoResolution } from '../../../../../core/services/photoPost'
import { t } from '../../../../../core/i18n'

type PostInfoProps = {
  postInfo: Photo
  imageLink: string
  onImageLoaded: () => void
  /** `original`: the black-and-white photo under the colour one while they are compared. */
  openFullScreen: (original?: boolean) => void
  onLinkPress?: (href: string) => void
  colorize?: PostColorize
}

// An observer: the colour version comes and goes without the panel re-rendering.
export const PostInfo: FC<PostInfoProps> = observer(({
  postInfo,
  imageLink,
  onImageLoaded,
  openFullScreen,
  onLinkPress,
  colorize,
}) => {
  const { colors } = useTheme()
  // The colour photo above the original is being zoomed and has to cover it.
  const [colourRaised, setColourRaised] = useState(false)
  const comparing = colorize?.isComparingOriginal ?? false
  const commentTotal = postInfo?.ccount || 0
  const titlesRegion = postInfo?.regions?.map(region => region.title_local).join(', ')
  const locationText = postInfo?.y + ', ' + titlesRegion
  const descriptionHTML = { html: `<p>${postInfo?.desc}</p>` }
  const sourceHTML = {
    html: `<p><strong>${t('photo.source')}:</strong> <span>${postInfo?.source || t('photo.sourceMissing')}</span></p>`,
  }
  const authorHTML = {
    html: `<p><strong>${t('photo.author')}:</strong> <span>${postInfo?.author || t('photo.authorUnknown')}</span></p>`,
  }
  const lastEditFormat = formatDate(postInfo?.cdate)
  return (
    <View>
      {colorize?.isColorized && (
        <ColourReveal open={comparing} raised={colourRaised}>
          <ImageZoom
            uri={colorize.displayLink}
            resolution={photoResolution(postInfo)}
            openFullScreenImage={() => openFullScreen()}
            onImageLoaded={noop}
            onZoomStart={() => setColourRaised(true)}
            onZoomEnd={() => setColourRaised(false)}
          />
        </ColourReveal>
      )}
      {/* The original, with the colour version laid over it once coloured. While compared the
          colour layer fades out here, as the colour photo now sits above. */}
      <ImageZoom
        uri={imageLink}
        overlayUri={colorize?.isColorized ? colorize.displayLink : undefined}
        overlayHidden={comparing}
        colorizing={colorize?.isColorizing}
        resolution={photoResolution(postInfo)}
        openFullScreenImage={() => openFullScreen(comparing)}
        onImageLoaded={onImageLoaded}
      />
      <Spacer height={12} />
      <View>
        <Text selectable style={[s.postTitleText, { color: colors.textFirst }]}>
          {postInfo?.title}
        </Text>
        <Spacer height={4} />
        <Text selectable style={[s.postLocationText, { color: colors.textSecond }]}>
          {locationText}
        </Text>
        <Spacer height={8} />
        {postInfo?.desc && (
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
            renderersProps={{
              a: { onPress: (_, href) => onLinkPress?.(href) },
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
              color: colors.primary,
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
        <View style={s.row}>
          <Text style={[s.commentHeaderText, { color: colors.textFirst }]}>{t('photo.comments')} </Text>
          <Text style={[s.commentHeaderText, { color: colors.textThird }]}>{commentTotal}</Text>
        </View>
        <Spacer height={12} />
      </View>
    </View>
  )
})

const noop = () => {}
