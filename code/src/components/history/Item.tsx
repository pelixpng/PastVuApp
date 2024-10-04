import { FC } from 'react'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { RootStackParamList } from '../../types/navigation'
import { Image } from 'expo-image'
import { Alert, TouchableOpacity, View } from 'react-native'
import { HistoryItem } from '../../screens/map/History'
import { TitleText, DescriptionText, s } from './style'

export const ItemHistory: FC<HistoryItem> = ({ title, description, cid, file }) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()
  return (
    <TouchableOpacity
      style={s.mainContainer}
      onPress={() => navigation.navigate('PhotoPage', { cid })}>
      <Image
        source={{ uri: `https://pastvu.com/_p/d/${file}` }}
        style={s.image}
        onError={() => Alert.alert('Ошибка', 'Не удалось загрузить изображение, попробуйте позже')}
        cachePolicy="disk"
      />
      <View style={s.infoContainer}>
        <TitleText numberOfLines={1}>{title}</TitleText>
        <DescriptionText numberOfLines={2}>{description}</DescriptionText>
      </View>
    </TouchableOpacity>
  )
}
