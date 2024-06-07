import { observer } from 'mobx-react-lite'
import { FC } from 'react'
import styled from 'styled-components/native'
import { perfectSize } from '../../../utils/ScreenSize'

interface ButtonProps {
  title: string
  value: string
  setValue: (value: string) => void
}

export const RadioButton: FC<ButtonProps> = observer(({ title, setValue, value }) => {
  return (
    <RadioButtonContainer onPress={() => setValue(title)}>
      {value == title ? <ActiveButton /> : <NoActiveButton />}
      <LabelContainer>
        <LabelText>{title}</LabelText>
      </LabelContainer>
    </RadioButtonContainer>
  )
})

export const RadioButtonContainer = styled.TouchableOpacity`
  display: flex;
  padding-top: ${perfectSize(10)};
  padding-bottom: ${perfectSize(10)};
  align-items: flex-start;
  gap: ${perfectSize(12)};
  align-self: stretch;
  flex-direction: row;
  background-color: ${props => props.theme.colors.MenuContainer};
`

export const NoActiveButton = styled.View`
  display: flex;
  width: ${perfectSize(22)};
  height: ${perfectSize(22)};
  align-items: flex-start;
  gap: ${perfectSize(10)};
  border-radius: 22px;
  background-color: #f4f4f4;
`
export const LabelContainer = styled.View`
  display: flex;
  align-items: center;
  gap: ${perfectSize(4)};
  background-color: ${props => props.theme.colors.backgroundApp};
`
export const LabelText = styled.Text`
  font-size: ${perfectSize(15)};
  font-style: normal;
  font-weight: 500;
  line-height: ${perfectSize(24)};
  color: ${props => props.theme.colors.titleMenuText};
  background-color: ${props => props.theme.colors.MenuContainer};
`

const ActiveButton = styled.View`
  width: ${perfectSize(22)};
  height: ${perfectSize(22)};
  border-radius: 22px;
  background-color: ${props => props.theme.colors.backgroundApp};
  border: 6px solid #6c86e2;
`
