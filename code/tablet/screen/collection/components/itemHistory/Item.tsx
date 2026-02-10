import { FC, useMemo } from 'react'
import { Image } from 'expo-image'
import { TouchableOpacity, View, Text } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { s } from './style'
import { useTheme } from '@react-navigation/native'
import { Spacer } from '../../../../../core/components/ui/Spacer'

type ItemHistoryProps = {
  onPress: () => void
  isSelected?: boolean
  title: string
  description: string
  file: string
  onRemove?: () => void
}

export const ItemHistory: FC<ItemHistoryProps> = ({
  title,
  description,
  file,
  onPress,
  isSelected,
  onRemove,
}) => {
  const { colors } = useTheme()
  const backgroundColor = useMemo(
    () => (isSelected ? colors.baseThird : null),
    [isSelected, colors],
  )
  return (
    <TouchableOpacity
      style={[s.mainContainer, { backgroundColor }]}
      onPress={onPress}
      onLongPress={onRemove}>
      <Image
        source={{ uri: `https://img.pastvu.com/h/${file}` }}
        style={s.image}
        cachePolicy="disk"
      />
      <Spacer width={12} />
      <View style={s.infoContainer}>
        <Text numberOfLines={1} style={[s.titleText, { color: colors.textFirst }]}>
          {title}
        </Text>
        <Spacer height={2} />
        <Text numberOfLines={2} style={[s.descriptionText, { color: colors.textThird }]}>
          {description}
        </Text>
      </View>
      {onRemove && (
        <TouchableOpacity style={s.removeButton} onPress={onRemove}>
          <Feather name="more-horizontal" size={25} color={colors.textThird} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  )
}
