import { FC, useState } from 'react'
import { Image } from 'expo-image'
import { Alert, TouchableOpacity, View, Text } from 'react-native'
import { Feather, MaterialIcons } from '../../../../../core/components/ui/icons'
import { s } from './style'
import { useTheme } from '@react-navigation/native'
import { Spacer } from '../../../../../core/components/ui/Spacer'
import { t } from '../../../../../core/i18n'

export type PhotoListItemProps = {
  onPress: () => void
  title: string
  description: string
  file: string
  onRemove?: () => void
  /** Shows the placeholder alone when the thumbnail fails, without the alert. */
  quietImageErrors?: boolean
  /** An icon in place of the thumbnail, for rows with no picture (a news post). */
  icon?: keyof typeof MaterialIcons.glyphMap
}

export const PhotoListItem: FC<PhotoListItemProps> = ({
  title,
  description,
  file,
  onPress,
  onRemove,
  quietImageErrors,
  icon,
}) => {
  const { colors } = useTheme()
  const [imageFailed, setImageFailed] = useState(false)
  return (
    <TouchableOpacity style={s.mainContainer} onPress={onPress} onLongPress={onRemove}>
      {icon || imageFailed ? (
        // Removed photos keep their title but lose their files.
        <View style={[s.image, s.placeholder, { backgroundColor: colors.baseFifth }]}>
          <MaterialIcons name={icon ?? 'no-photography'} size={28} color={colors.textThird} />
        </View>
      ) : (
        <Image
          source={{ uri: `https://img.pastvu.com/h/${file}` }}
          style={s.image}
          onError={() => {
            setImageFailed(true)
            if (!quietImageErrors) Alert.alert(t('common.error'), t('photo.imageError'))
          }}
          cachePolicy="disk"
        />
      )}
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
      {onRemove && (
        <TouchableOpacity style={s.removeButton} onPress={onRemove}>
          <Feather name="more-horizontal" size={25} color={colors.textThird} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  )
}
