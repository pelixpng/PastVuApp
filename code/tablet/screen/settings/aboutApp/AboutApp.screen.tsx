import { FC } from 'react'
import { StyleProp, ViewStyle } from 'react-native'
import { Container } from '../../../../core/components/ui/Container'
import { AboutContent } from '../../../../core/components/settings/AboutContent'

type AboutAppScreenProps = {
  /** Side margins for the width the settings menu leaves. */
  style: StyleProp<ViewStyle>
  /** Paired buttons side by side, when the content is wide enough for their longest labels. */
  wide: boolean
}

export const AboutAppScreen: FC<AboutAppScreenProps> = ({ style, wide }) => (
  <Container isScroll style={style}>
    <AboutContent wide={wide} />
  </Container>
)
