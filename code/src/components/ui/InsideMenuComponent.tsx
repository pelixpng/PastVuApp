import React, { FC } from 'react'
import {
  InsideMenuContainer,
  MenuDescriptionText,
  MenuInsideTextContainer,
  MenuTitleText,
} from './UniversalComponents'
import { InsideMenuProps } from '../../types/components'
import { MyButton } from '../buttons/MyButton'
import { Linking } from 'react-native'

export const InsideMenuComponent: FC<InsideMenuProps> = ({
  ButtonArray,
  title,
  description: description,
  children,
}) => {
  return (
    <InsideMenuContainer>
      <MenuInsideTextContainer>
        <MenuTitleText>{title}</MenuTitleText>
        <MenuDescriptionText>{description}</MenuDescriptionText>
      </MenuInsideTextContainer>
      {ButtonArray &&
        ButtonArray.map((item, index) => (
          <MyButton title={item.title} func={() => Linking.openURL(item.url)} key={index} />
        ))}
      {children}
    </InsideMenuContainer>
  )
}
