import { FC, ReactNode } from 'react'
import { Platform } from 'react-native'
import styled, { css } from 'styled-components/native'

type UICardProps = {
  children: ReactNode[] | ReactNode
  onPress?: () => void
}

export const UICard: FC<UICardProps> = ({ children, onPress }) => {
  if (onPress) {
    return <TouchableContainer>{children}</TouchableContainer>
  }
  return <Container>{children}</Container>
}

const sharedStyles = css`
  padding: 16px;
  align-items: flex-start;
  gap: 12px;
  border-radius: 16px;
  margin: 8px 16px;
  background: ${props => props.theme.colors.baseSecond};
  ${Platform.OS === 'android'
    ? 'elevation: 4;'
    : 'shadow-color: rgba(0, 0, 0, 0.12); shadow-opacity: 1; shadow-radius: 4px; shadow-offset: 0px 4px;'}
`

const Container = styled.View`
  ${sharedStyles}
`

const TouchableContainer = styled.TouchableOpacity`
  ${sharedStyles}
`
