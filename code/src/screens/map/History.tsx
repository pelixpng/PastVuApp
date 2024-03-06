import React, { FC } from 'react'
import { ViewContainer } from '../../components/ui/UniversalComponents'
import { ItemHistory } from '../../components/history/Item'
import { HistoryItem, Storage } from '../../storage/Storage'
import { MenuButton } from '../../components/buttons/MenuButton'
import { FlatList } from 'react-native'

export const History: FC = () => {
  const historyString = Storage.getString('History') ?? '[]'
  const parseArr: HistoryItem[] = JSON.parse(historyString)
  return (
    <ViewContainer>
      <FlatList
        data={parseArr}
        renderItem={({ item }) => (
          <ItemHistory
            cid={item.cid}
            title={item.title}
            description={item.description}
            file={item.file}
          />
        )}
        contentContainerStyle={{ paddingHorizontal: 10 }}
        keyExtractor={item => item.cid}
        ListEmptyComponent={
          <MenuButton
            title={'История просмотра'}
            description={'История сохраняет последние 1000 просмотренных фотографий'}
            icon={'history'}
          />
        }
      />
    </ViewContainer>
  )
}
