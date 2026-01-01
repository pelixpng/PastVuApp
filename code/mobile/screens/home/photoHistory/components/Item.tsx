import { FC } from 'react'
import { Image } from 'expo-image'
import { Alert, TouchableOpacity, View, Text } from 'react-native'
import { s } from './style'
import { useTheme } from '@react-navigation/native'
import { Spacer } from '../../../../../core/components/ui/Spacer'

type ItemHistoryProps = {
  onPress: () => void
  title: string
  description: string
  file: string
}

export const ItemHistory: FC<ItemHistoryProps> = ({ title, description, file, onPress }) => {
  const { colors } = useTheme()
  return (
    <TouchableOpacity style={s.mainContainer} onPress={onPress}>
      <Image
        source={{ uri: `https://img.pastvu.com/h/${file}` }}
        style={s.image}
        onError={() => Alert.alert('Ошибка', 'Не удалось загрузить изображение, попробуйте позже')}
        cachePolicy="disk"
      />
      <Spacer width={12} />
      <View style={s.infoContainer}>
        <Text numberOfLines={1} style={[s.titleText, { color: colors.textFirst }]}>
          {title}
        </Text>
        <Spacer height={4} />
        <Text numberOfLines={2} style={[s.descriptionText, { color: colors.textThird }]}>
          {description}
        </Text>
      </View>
    </TouchableOpacity>
  )
}
