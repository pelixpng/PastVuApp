import { FC, useMemo } from 'react'
import { Image } from 'expo-image'
import { TouchableOpacity, View, Text } from 'react-native'
import { s } from './style'
import { useTheme } from '@react-navigation/native'
import { Spacer } from '../../../../../core/components/ui/Spacer'

type ItemHistoryProps = {
  onPress: () => void
  isSelected?: boolean
  title: string
  description: string
  file: string
}

export const ItemHistory: FC<ItemHistoryProps> = ({
  title,
  description,
  file,
  onPress,
  isSelected,
}) => {
  const { colors } = useTheme()
  const backgroundColor = useMemo(
    () => (isSelected ? colors.selectedItem : null),
    [isSelected, colors],
  )
  return (
    <TouchableOpacity style={[s.mainContainer, { backgroundColor }]} onPress={onPress}>
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
        <Spacer height={4} />
        <Text numberOfLines={2} style={[s.descriptionText, { color: colors.textThird }]}>
          {description}
        </Text>
      </View>
    </TouchableOpacity>
  )
}
