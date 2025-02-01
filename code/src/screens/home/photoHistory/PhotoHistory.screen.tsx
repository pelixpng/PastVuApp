import { useCallback } from 'react'
import { ViewContainer } from '../../../components/ui/Containers'
import { FlatList } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { MenuButton } from '../../../components/ui/buttons/MenuButton'
import { useVM } from '../../../hooks/useVM'
import { ItemHistory } from './components/Item'
import { observer } from 'mobx-react'
import PhotoHistoryVM from './PhotoHistory.vm'

export interface HistoryItem {
  title: string
  description: string
  cid: string
  file: string
}

export const PhotoHistoryScreen = observer(() => {
  const vm = useVM(PhotoHistoryVM)
  useFocusEffect(
    useCallback(() => {
      vm.getPhotos()
    }, [vm]),
  )
  return (
    <ViewContainer>
      <FlatList
        data={vm.photos}
        keyExtractor={item => item.cid}
        renderItem={({ item }) => (
          <ItemHistory
            title={item.title}
            description={item.description}
            file={item.file}
            onPress={() => vm.openPhoto(item.cid, item.title)}
          />
        )}
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
})
