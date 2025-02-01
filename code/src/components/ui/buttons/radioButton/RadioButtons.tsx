import { FC } from 'react'
import { View, TouchableOpacity } from 'react-native'
import { LabelText, RadioButton, s } from './style'

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
  return (
    <View style={s.block}>
      {options.map(item => (
        <TouchableOpacity key={item.value} style={s.container} onPress={() => setValue(item.value)}>
          <RadioButton isActive={item.value === selectedValue} />
          <LabelText>{item.label}</LabelText>
        </TouchableOpacity>
      ))}
    </View>
  )
}
