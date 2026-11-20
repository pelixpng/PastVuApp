import { FC } from 'react'
import { StyleProp, ViewStyle } from 'react-native'
import { Container } from '../../../../core/components/ui/Container'
import { SupportContent } from '../../../../core/components/settings/SupportContent'

type SupportContactsScreenProps = {
  /** Side margins for the width the settings menu leaves. */
  style: StyleProp<ViewStyle>
  /** The two buttons side by side, when the content is wide enough for their labels. */
  wide: boolean
}

export const SupportContactsScreen: FC<SupportContactsScreenProps> = ({ style, wide }) => (
  <Container style={style}>
    <SupportContent wide={wide} />
  </Container>
)
