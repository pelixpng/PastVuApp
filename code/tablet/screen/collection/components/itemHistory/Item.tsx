import { FC, useMemo, useState } from 'react'
import { Image } from 'expo-image'
import { TouchableOpacity, View, Text } from 'react-native'
import { Feather, MaterialIcons } from '../../../../../core/components/ui/icons'
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
  /** An icon in place of the thumbnail, for rows with no picture (a news post). */
  icon?: keyof typeof MaterialIcons.glyphMap
}

export const ItemHistory: FC<ItemHistoryProps> = ({
  title,
  description,
  file,
  onPress,
  isSelected,
  onRemove,
  icon,
}) => {
  const { colors, names } = useTheme()
  // The light grey is too faint on the selected row's dark grey.
  const descriptionColor =
    isSelected && names.themeName === 'dark' ? colors.textSecond : colors.textThird
  const [imageFailed, setImageFailed] = useState(false)
  const backgroundColor = useMemo(
    () => (isSelected ? colors.baseThird : null),
    [isSelected, colors],
  )
  return (
    <TouchableOpacity
      style={[s.mainContainer, { backgroundColor }]}
      onPress={onPress}
      onLongPress={onRemove}>
      {icon || imageFailed ? (
        // Removed photos keep their title but lose their files.
        <View style={[s.image, s.placeholder, { backgroundColor: colors.baseFifth }]}>
          <MaterialIcons name={icon ?? 'no-photography'} size={28} color={colors.textThird} />
        </View>
      ) : (
        <Image
          source={{ uri: `https://img.pastvu.com/h/${file}` }}
          style={s.image}
          onError={() => setImageFailed(true)}
          cachePolicy="disk"
        />
      )}
      <Spacer width={12} />
      <View style={s.infoContainer}>
        <Text numberOfLines={1} style={[s.titleText, { color: colors.textFirst }]}>
          {title}
        </Text>
        <Spacer height={2} />
        <Text numberOfLines={2} style={[s.descriptionText, { color: descriptionColor }]}>
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
