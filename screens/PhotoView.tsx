import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, Text, ScrollView  } from 'react-native';
import { MapScreenNavigationProp, Propss } from '../types/Navigation.types';
import { MenuDescriptionText, MenuInsideTextContainer, MenuTitleText, ScrollContainer, ViewContainer } from '../components/UniversalComponents';
import styled from 'styled-components/native'
import { InsideMenuComponent } from '../components/InsideMenuComponent';

type Props = {
    route: { params: { url: string } };
  };


export const PhotoPage: React.FC<Props> = ({route}) => {
  const imageUri: string = route.params.url
  return (
      //Добавить кнопку поделиться
      <Container>
          <Photo source={{ uri: imageUri }} resizeMode='contain'/>
          <PhotoInfo>
            <MenuInsideTextContainer>
              <MenuTitleText>Дом Фрунзе</MenuTitleText>
              <MenuDescriptionText>Это дом того самого Михаила Фрунзе в городе Бишкек в Республике Кыргистан</MenuDescriptionText>
            </MenuInsideTextContainer>
          </PhotoInfo>
      </Container>
      
  );
};

const Photo = styled.Image`
  width: 100%;
  height: 40%;
  background-color: aliceblue;
`

const Container = styled.View`
  flex: 1;
  background-color: pink;
`
const PhotoInfo = styled.View`
  padding-left: 20px;
  padding-right: 20px;
  gap: 5px;
  width: 100%;
  height: auto;
`