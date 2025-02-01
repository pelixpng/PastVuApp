import { FC } from 'react'
import { Image } from 'expo-image'
import { Alert, TouchableOpacity, View } from 'react-native'
import { DescriptionText, s, TitleText } from './style'

type ItemHistoryProps = {
  onPress: () => void
  title: string
  description: string
  file: string
}

export const ItemHistory: FC<ItemHistoryProps> = ({ title, description, file, onPress }) => {
  return (
    <TouchableOpacity style={s.mainContainer} onPress={onPress}>
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
