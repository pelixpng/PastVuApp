import React, { FC } from 'react'
import { Text, View } from 'react-native'
import { AppIconContainer, LogoContainer, MenuDescriptionText, ScrollContainer } from '../components/UniversalComponents'
import { ButtonLinkProps, InsideMenuProps } from '../types/components.types';
import { InsideMenuComponent } from '../components/InsideMenuComponent';
import { ButtonLink } from '../components/ButtonLink';


const ResourcesUsed: ButtonLinkProps[] = [
  { title: 'PastVu Api', url: 'https://docs.pastvu.com/dev/api' },
  { title: 'Maps Platform', url: 'https://developers.google.com/maps?hl=ru' },
];

const Developers: ButtonLinkProps[] = [
  { title: 'Семён Кузьмин', url: 'https://t.me/paveldur0' },
];

const InsideMenuText: InsideMenuProps[] = [
  { 
    title: 'Используемые ресурсы', 
    discription: 'Для получения фотографий и информации о них используется открытое  Api проекта PastVu. Карта предоставлена Google Maps Platform.' 
  },
  { 
    title: 'Разработчики', 
    discription: 'Персоны участвовашие в разработке и отладке приложения.' 
  }
];


export const AppInfo: FC = () => {
  return (
    <ScrollContainer>
      <AppIconContainer>
        <LogoContainer
				  source={require('../assets/icon.png')}
			  />
        <MenuDescriptionText>Версия 1.0.0 от 1 августа 2023 г.</MenuDescriptionText>
      </AppIconContainer>
      <InsideMenuComponent ButtonArray={ResourcesUsed} title={InsideMenuText[0].title} discription={InsideMenuText[0].discription}/>
      <InsideMenuComponent ButtonArray={Developers} title={InsideMenuText[1].title} discription={InsideMenuText[1].discription} />
    </ScrollContainer>
  )
}

