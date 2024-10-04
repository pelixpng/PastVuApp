import { FC } from 'react'
import { Linking, Platform, View } from 'react-native'
import { MenuTitleText, MenuDescriptionText } from './Texts'
import { MyButton } from './buttons/MyButton'
import { UICardProps } from '../../types/components'
import styled from 'styled-components/native'

export const UICard: FC<UICardProps> = ({
  ButtonArray,
  title,
  description: description,
  children,
}) => {
  return (
    <InsideMenuContainer>
      <View>
        <MenuTitleText>{title}</MenuTitleText>
        <MenuDescriptionText>{description}</MenuDescriptionText>
      </View>
      {ButtonArray &&
        ButtonArray.map((item, index) => (
          <MyButton title={item.title} func={() => Linking.openURL(item.url)} key={index} />
        ))}
      {children}
    </InsideMenuContainer>
  )
}

const InsideMenuContainer = styled.View`
  padding: 16px;
  align-items: flex-start;
  gap: 12;
  border-radius: 16px;
  margin-top: 8;
  margin-bottom: 8;
  margin-left: 16;
  margin-right: 16;
  background: ${props => props.theme.colors.baseSecond};
  ${Platform.OS === 'android'
    ? 'elevation: 4;'
    : 'shadow-color: rgba(0, 0, 0, 0.12); shadow-opacity: 1; shadow-radius: 4px; shadow-offset: 0px 4px;'}
`
