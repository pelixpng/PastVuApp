import React, { FC } from 'react'
import styled from 'styled-components/native'
import { perfectSize } from '../../utils/ScreenSize'
import { StyledColor } from '../../types/styled'

type CustomMarkerProps = {
	color: string
}

export const CustomMarker: FC<CustomMarkerProps> = ({ color }) => {
	return <AeroOrNull bg={color} />
}

const AeroOrNull = styled.View<StyledColor>`
	width: 22px;
	height: 22px;
	border-radius: 40px;
	background-color: #3d3d3d;
	border: 6px solid ${props => props.bg};
`
