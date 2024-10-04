import { FC } from 'react'
import { View, TouchableOpacity } from 'react-native'
import { ActiveButton, LabelText, NoActiveButton, s } from './style'

type RadioButtonsProps = {
  titles: string[]
  value: string
  setValue: (value: string) => void
}

export const RadioButtons: FC<RadioButtonsProps> = ({ titles, value, setValue }) => {
  return (
    <View style={s.block}>
      {titles.map(item => (
        <TouchableOpacity style={s.container} onPress={() => setValue(item)}>
          {value == item ? <ActiveButton /> : <NoActiveButton />}
          <LabelText>{item}</LabelText>
        </TouchableOpacity>
      ))}
    </View>
  )
}
