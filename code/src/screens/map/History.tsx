import React, { FC } from 'react'
import { FlatList } from 'react-native'
import { ViewContainer } from '../../components/ui/UniversalComponents'
import { ItemHistory } from '../../components/history/Item'
import { HistoryItem, Storage } from '../../storage/Storage'
import { MenuButton } from '../../components/buttons/MenuButton'

export const History: FC = () => {
	const historyString = Storage.getString('History') ?? '[]'
	const parseArr: HistoryItem[] = JSON.parse(historyString)
	return (
		<ViewContainer>
			{parseArr.length > 0 ? (
				<FlatList
					style={{
						width: '100%',
						paddingHorizontal: 10
					}}
					data={parseArr}
					renderItem={({ item }) => (
						<ItemHistory
							cid={item.cid}
							title={item.title}
							description={item.description}
							file={item.file}
						/>
					)}
					keyExtractor={item => item.cid}
					onEndReachedThreshold={0.25}
				/>
			) : (
				<MenuButton
					title={'История просмотра'}
					description={
						'История сохраняет последние 400 просмотренных фотографий'
					}
					icon={'history'}
				/>
			)}
		</ViewContainer>
	)
}
