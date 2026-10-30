import { StyleSheet } from 'react-native'
import { Container } from '../../../../core/components/ui/Container'
import { SupportContent } from '../../../../core/components/settings/SupportContent'

export const SupportContactsScreen = () => (
  <Container style={s.container}>
    <SupportContent wide />
  </Container>
)

const s = StyleSheet.create({
  container: { paddingRight: 48, paddingLeft: 32 },
})
