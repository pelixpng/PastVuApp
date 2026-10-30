import { StyleSheet } from 'react-native'
import { Container } from '../../../../core/components/ui/Container'
import { AboutContent } from '../../../../core/components/settings/AboutContent'

export const AboutAppScreen = () => (
  <Container isScroll style={s.container}>
    <AboutContent wide />
  </Container>
)

const s = StyleSheet.create({
  container: { paddingRight: 48, paddingLeft: 32 },
})
