import { FC } from 'react'
import { MaterialIcons } from '@expo/vector-icons'
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
}

export const MenuButton: FC<MenuButtonProps> = ({ title, description, icon, onPress }) => {
  const { colors } = useTheme()
  return (
    <UICard onPress={onPress}>
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
