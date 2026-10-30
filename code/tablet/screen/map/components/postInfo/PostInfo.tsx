import { FC, useState } from 'react'
import { View } from 'react-native'
import { observer } from 'mobx-react-lite'
import { Spacer } from '../../../../../core/components/ui/Spacer'
import { ImageZoom } from '../../../../../core/components/photo/ImageZoom'
import { ColourReveal } from '../../../../../core/components/colorize/ColourReveal'
import { PostText } from '../../../../../core/components/post/PostText'
import { PostColorize } from '../../../../../core/store/PostColorize'
import { photoResolution, Resolution } from '../../../../../core/services/photoPost'

type PostInfoProps = {
  postInfo: Photo
  imageLink: string
  onImageLoaded: () => void
  /** The photo's size as it loaded, which full screen takes instead of measuring it again. */
  onImageResolution?: (resolution: Resolution, uri: string) => void
  /** `original`: the black-and-white photo under the colour one while they are compared. */
  openFullScreen: (original?: boolean) => void
  onLinkPress?: (href: string) => void
  colorize?: PostColorize
  /** Opens another photo in this panel; without it the nearby photos are left out. */
  onOpenPhoto?: (cid: string) => void
}

// An observer: the colour version comes and goes without the panel re-rendering.
export const PostInfo: FC<PostInfoProps> = observer(({
  postInfo,
  imageLink,
  onImageLoaded,
  onImageResolution,
  openFullScreen,
  onLinkPress,
  colorize,
  onOpenPhoto,
}) => {
  // The colour photo above the original is being zoomed and has to cover it.
  const [colourRaised, setColourRaised] = useState(false)
  const comparing = colorize?.isComparingOriginal ?? false
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
        onImageResolution={onImageResolution}
      />
      <Spacer height={12} />
      <PostText postInfo={postInfo} onLinkPress={onLinkPress} onOpenPhoto={onOpenPhoto} />
    </View>
  )
})

const noop = () => {}
