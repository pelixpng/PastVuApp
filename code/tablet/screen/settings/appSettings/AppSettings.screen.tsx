import { StyleSheet } from 'react-native'
import { Container } from '../../../../core/components/ui/Container'
import { AppSettingsContent } from '../../../../core/components/settings/AppSettingsContent'

export const AppSettingsScreen = () => (
	<Container isScroll style={s.container}>
		<AppSettingsContent />
	</Container>
)

const s = StyleSheet.create({
	container: { paddingRight: 48, paddingLeft: 32 }
})
