import { FC } from 'react'
import { View, TouchableOpacity, Text } from 'react-native'
import { useTheme } from '@react-navigation/native'
import { s } from './style'

export type OptionsRadioButton = {
  label: string
  value: string
}

type RadioButtonsProps = {
  options: OptionsRadioButton[]
  selectedValue: string
  setValue: (value: string) => void
}

export const RadioButtons: FC<RadioButtonsProps> = ({ options, selectedValue, setValue }) => {
  const { colors } = useTheme()
  const renderButton = ({ label, value }: OptionsRadioButton) => {
    const isSelected = value === selectedValue
    return (
      <TouchableOpacity key={value} style={s.container} onPress={() => setValue(value)}>
        <View
          style={[
            s.radioButton,
            {
              backgroundColor: isSelected ? colors.backgroundApp : colors.baseFourth,
              borderWidth: isSelected ? 6 : 0,
              borderColor: isSelected ? colors.basePrimary : 'transparent',
            },
          ]}
        />
        <Text style={[s.labelText, { color: colors.textFirst }]}>{label}</Text>
      </TouchableOpacity>
    )
  }

  return <View style={s.block}>{options.map(renderButton)}</View>
}
