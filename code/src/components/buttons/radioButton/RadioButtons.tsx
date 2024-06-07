import { FC } from 'react'
import styled from 'styled-components/native'
import { RadioButton } from './RadioButton'

type RadioButtonsProps = {
  titles: string[]
  value: string
  setValue: (value: string) => void
}

export const RadioButtons: FC<RadioButtonsProps> = ({ titles, value, setValue }) => {
  return (
    <GroupRadioButtonContainer>
      {titles.map((item, index) => (
        <RadioButton title={item} key={index} value={value} setValue={setValue} />
      ))}
    </GroupRadioButtonContainer>
  )
}

export const GroupRadioButtonContainer = styled.View`
  display: flex;
  align-items: flex-start;
  flex-shrink: 0;
  background-color: ${props => props.theme.colors.MenuContainer};
`
