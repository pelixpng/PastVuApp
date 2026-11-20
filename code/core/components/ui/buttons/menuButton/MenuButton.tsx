import { FC } from 'react'
import { MaterialIcons } from '../../icons'
import { View, Text } from 'react-native'
import { useTheme } from '@react-navigation/native'
import { UICard } from '../../UICards'
import { s } from './style'
import { Spacer } from '../../Spacer'

type MenuButtonProps = {
  title: string
  description: string
  icon: 'mail' | 'info' | 'settings' | 'history'
  onPress?: () => void
  /**
   * The section shown beside the menu right now, as in the tablet's settings, where the menu stays
   * on screen next to it. Screen readers announce it as selected; the card looks the same, since
   * the section itself shows beside it. Off by default.
   */
  selected?: boolean
}

export const MenuButton: FC<MenuButtonProps> = ({
  title,
  description,
  icon,
  onPress,
  selected = false,
}) => {
  const { colors } = useTheme()
  return (
    <UICard onPress={onPress} accessibilityState={selected ? { selected } : undefined}>
      <View style={s.container}>
        <View style={s.textBlock}>
          <Text style={[s.titleText, { color: colors.textFirst }]}>{title}</Text>
          <Text style={[s.descriptionText, { color: colors.textSecond }]}>{description}</Text>
        </View>
        <Spacer width={12} />
        <View style={s.bgIcon}>
          <MaterialIcons name={icon} size={28} color="white" />
        </View>
      </View>
    </UICard>
  )
}
