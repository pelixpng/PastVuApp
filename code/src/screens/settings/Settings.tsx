import React from 'react'
import { ScrollContainer } from '../../components/ui/UniversalComponents'
import { MenuButton } from '../../components/buttons/MenuButton'
import { SafeAreaView } from 'react-native-safe-area-context'

export const SettingsComponent: React.FC = () => {
	return (
		<SafeAreaView>
			<ScrollContainer>
				<MenuButton
					route={'FeedBack'}
					title={'Обратная связь'}
					description={'Контакты для связи с разработчиком'}
					icon={'mail'}
				/>
				<MenuButton
					route={'AppInfo'}
					title={'О приложении'}
					description={'Версия и используемые ресурсы'}
					icon={'info'}
				/>
				<MenuButton
					route={'MapSettings'}
					title={'Настройки'}
					description={'Настройки интерфейса и карты'}
					icon={'settings'}
				/>
			</ScrollContainer>
		</SafeAreaView>
	)
}
