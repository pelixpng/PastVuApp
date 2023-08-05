import React from 'react'
import { ScrollContainer } from '../components/UniversalComponents'
import { MenuButton } from '../components/MenuButton'
import { SettingsRoutes } from '../navigation/Routes'
import { SettingsScreenNavigationProp } from '../types/Navigation'
import { SafeAreaView } from 'react-native-safe-area-context'

export const SettingsComponent: React.FC<SettingsScreenNavigationProp> = ({
	navigation
}) => {
	return (
		<SafeAreaView>
			<ScrollContainer>
				<MenuButton
					navigation={navigation}
					route={SettingsRoutes.FeedBack}
					title={'Обратная связь'}
					discription={'Контакты для связи с разработчиком'}
					icon={'mail'}
				/>
				<MenuButton
					navigation={navigation}
					route={SettingsRoutes.AppInfo}
					title={'О приложении'}
					discription={'Версия и используемые ресурсы'}
					icon={'info'}
				/>
				<MenuButton
					navigation={navigation}
					route={SettingsRoutes.MapSettings}
					title={'Настройки'}
					discription={'Настройки интерфейса и карты'}
					icon={'settings'}
				/>
			</ScrollContainer>
		</SafeAreaView>
	)
}
