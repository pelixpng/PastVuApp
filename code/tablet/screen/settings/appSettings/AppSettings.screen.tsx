import { FC } from 'react'
import { StyleProp, ViewStyle } from 'react-native'
import { Container } from '../../../../core/components/ui/Container'
import { AppSettingsContent } from '../../../../core/components/settings/AppSettingsContent'

type AppSettingsScreenProps = {
	/** Side margins for the width the settings menu leaves. */
	style: StyleProp<ViewStyle>
}

export const AppSettingsScreen: FC<AppSettingsScreenProps> = ({ style }) => (
	<Container isScroll style={style}>
		<AppSettingsContent />
	</Container>
)
