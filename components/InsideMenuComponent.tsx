import { FC } from 'react'
import { Text, View } from 'react-native'
import { InsideMenuContainer, MenuDescriptionText, MenuInsideTextContainer, MenuTitleText, ViewContainer } from './UniversalComponents'
import { ButtonLink } from './ButtonLink'
import { ButtonLinkProps, InsideMenuProps } from '../types/components.types'

export const InsideMenuComponent: FC<InsideMenuProps> = ({ButtonArray, title, discription, child, child2}) => {
  return (
      <InsideMenuContainer>
        <MenuInsideTextContainer>
          <MenuTitleText>{title}</MenuTitleText>
          <MenuDescriptionText>{discription}</MenuDescriptionText>
        </MenuInsideTextContainer>  
          {ButtonArray && ButtonArray.map((item, index) => (
            <ButtonLink title={item.title} url={item.url} key={index} />
          ))}
          {child && child}
          {child2 && child2}
      </InsideMenuContainer>
  )
}