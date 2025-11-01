import { useCallback } from 'react'
import { FlatList } from 'react-native'
import { useFocusEffect, useTheme } from '@react-navigation/native'
import { useVM } from '../../../hooks/useVM'
import { observer } from 'mobx-react'
import PhotoHistoryVM from './PhotoHistory.vm'
import { ItemHistory } from './components/Item'
import { MenuButton } from '../../../components/ui/buttons/menuButton/MenuButton'
import { Spacer } from '../../../components/ui/Spacer'

export interface HistoryItem {
  title: string
  description: string
  cid: string
  file: string
}

export const PhotoHistoryScreen = observer(() => {
  const vm = useVM(PhotoHistoryVM)
  const { colors } = useTheme()
  useFocusEffect(
    useCallback(() => {
      vm.getPhotos()
    }, [vm]),
  )
  return (
    <FlatList
      data={vm.photos}
      style={{ backgroundColor: colors.backgroundApp }}
      keyExtractor={item => item.cid}
      ListHeaderComponent={<Spacer height={18} />}
      ItemSeparatorComponent={() => <Spacer height={16} />}
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
  )
})
