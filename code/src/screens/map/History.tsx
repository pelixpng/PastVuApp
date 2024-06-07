import { useState, useCallback } from 'react'
import { ViewContainer } from '../../components/ui/UniversalComponents'
import { ItemHistory } from '../../components/history/Item'
import { MMKVStorage } from '../../storage/Storage'
import { MenuButton } from '../../components/buttons/MenuButton'
import { FlatList } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { INSET_TOP } from '../../constants/sizes'

export interface HistoryItem {
  title: string
  description: string
  cid: string
  file: string
}

export const History = () => {
  const [historyArr, setHistoryArr] = useState<Array<HistoryItem>>([])
  useFocusEffect(
    useCallback(() => {
      setHistoryArr(MMKVStorage.get('History') ?? [])
    }, []),
  )
  return (
    <ViewContainer paddingTop={INSET_TOP}>
      <FlatList
        data={historyArr}
        renderItem={({ item }) => (
          <ItemHistory
            cid={item.cid}
            title={item.title}
            description={item.description}
            file={item.file}
          />
        )}
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
