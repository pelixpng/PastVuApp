import React, { FC } from 'react'
import {
  AppIconContainer,
  LogoContainer,
  MenuDescriptionText,
  ScrollContainer,
} from '../../components/ui/UniversalComponents'
import { InsideMenuProps, LinkProps } from '../../types/components'
import { InsideMenuComponent } from '../../components/ui/InsideMenuComponent'

const ResourcesUsed: LinkProps[] = [
  { title: 'PastVu Api', url: 'https://docs.pastvu.com/dev/api' },
  { title: 'Maps Platform', url: 'https://developers.google.com/maps?hl=ru' },
]

const AboutProject: LinkProps[] = [
  { title: 'О проекте PastVu', url: 'https://docs.pastvu.com/about' },
  { title: 'GitHub приложения', url: 'https://github.com/pelixpng/PastVuApp' },
  { title: 'Web версия PastVu', url: 'https://pastvu.com/' },
]

const Developers: LinkProps[] = [{ title: 'Семён Кузьмин', url: 'https://t.me/semenKuzminWork' }]

const InsideMenuText: InsideMenuProps[] = [
  {
    title: 'Что такое PastVu?',
    description:
      'Данное приложение является мобильной версией проекта PastVu, а также имеет полностью открытый исходный код.  PastVu - проект по сбору свидетельств прошлого в фотографиях, взгляд на историю среды обитания человечества.',
  },
  {
    title: 'Используемые ресурсы',
    description:
      'Для получения фотографий и информации о них используется открытое  Api проекта PastVu. Карта предоставлена Google Maps Platform.',
  },
  {
    title: 'Разработчики',
    description: 'Персоны участвовавшие в разработке и отладке приложения.',
  },
]

export const AppInfo: FC = () => {
  return (
    <ScrollContainer>
      <AppIconContainer>
        <LogoContainer source={require('../../../assets/icon.png')} />
        <MenuDescriptionText>Версия 1.5.1 от 1 апреля 2024 г.</MenuDescriptionText>
      </AppIconContainer>
      <InsideMenuComponent
        ButtonArray={AboutProject}
        title={InsideMenuText[0].title}
        description={InsideMenuText[0].description}
      />
      <InsideMenuComponent
        ButtonArray={ResourcesUsed}
        title={InsideMenuText[1].title}
        description={InsideMenuText[1].description}
      />
      <InsideMenuComponent
        ButtonArray={Developers}
        title={InsideMenuText[2].title}
        description={InsideMenuText[2].description}
      />
    </ScrollContainer>
  )
}
