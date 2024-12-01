import * as Application from 'expo-application'
import { ScrollContainer } from '../../components/ui/Containers'
import { MenuDescriptionText } from '../../components/ui/Texts'
import { LinkProps, UICardProps } from '../../types/components'
import { UICard } from '../../components/ui/UICards'
import { Image, View, StyleSheet } from 'react-native'

const ResourcesUsed: LinkProps[] = [
  { title: 'PastVu Api', url: 'https://docs.pastvu.com/dev/api' },
  { title: 'Maps Platform', url: 'https://developers.google.com/maps?hl=ru' },
]

const AboutProject: LinkProps[] = [
  { title: 'О проекте PastVu', url: 'https://docs.pastvu.com/about' },
  { title: 'GitHub приложения', url: 'https://github.com/pelixpng/PastVuApp' },
  { title: 'Web версия PastVu', url: 'https://pastvu.com/' },
]

const Developers: LinkProps[] = [
  { title: 'Семён Кузьмин • Разработчик', url: 'https://t.me/semenKuzminWork' },
  { title: 'Артём Костюченко • Дизайнер', url: 'https://t.me/ArtemWaves' },
]

const InsideMenuText: UICardProps[] = [
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

export const AppInfo = () => {
  const version = Application.nativeApplicationVersion
  return (
    <ScrollContainer>
      <View style={s.block}>
        <Image style={s.image} source={require('../../../assets/icon.png')} />
        <MenuDescriptionText>Версия {version} от 27 ноября 2024 г.</MenuDescriptionText>
      </View>
      <UICard
        ButtonArray={AboutProject}
        title={InsideMenuText[0].title}
        description={InsideMenuText[0].description}
      />
      <UICard
        ButtonArray={ResourcesUsed}
        title={InsideMenuText[1].title}
        description={InsideMenuText[1].description}
      />
      <UICard
        ButtonArray={Developers}
        title={InsideMenuText[2].title}
        description={InsideMenuText[2].description}
      />
    </ScrollContainer>
  )
}

const s = StyleSheet.create({
  block: { width: '100%', alignItems: 'center', gap: 16, marginBottom: 24 },
  image: { width: 128, height: 128, borderRadius: 400 },
})
