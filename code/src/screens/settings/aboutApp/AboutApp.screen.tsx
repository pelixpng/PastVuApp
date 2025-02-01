import { Image, View, StyleSheet } from 'react-native'
import { useVM } from '../../../hooks/useVM'
import AboutAppVM from './AboutApp.vm'
import { MenuDescriptionText, MenuTitleText } from '../../../components/ui/Texts'
import { MyButton } from '../../../components/ui/buttons/MyButton'
import { ScrollContainer } from '../../../components/ui/Containers'
import { UICard } from '../../../components/ui/UICards'

export const AboutAppScreen = () => {
  const vm = useVM(AboutAppVM)
  return (
    <ScrollContainer>
      <View style={s.block}>
        <Image style={s.image} source={require('../../../../assets/icon.png')} />
        <MenuDescriptionText>Версия {vm.version} от 27 ноября 2024 г.</MenuDescriptionText>
      </View>
      <UICard>
        <View>
          <MenuTitleText>Что такое PastVu?</MenuTitleText>
          <MenuDescriptionText>
            Данное приложение является мобильной версией проекта PastVu, а также имеет полностью
            открытый исходный код. PastVu - проект по сбору свидетельств прошлого в фотографиях,
            взгляд на историю среды обитания человечества.
          </MenuDescriptionText>
        </View>
        <MyButton title={'О проекте PastVu'} func={() => vm.openLink('aboutPastVu')} />
        <MyButton title={'Web версия PastVu'} func={() => vm.openLink('web')} />
        <MyButton title={'GitHub приложения'} func={() => vm.openLink('sourceCode')} />
      </UICard>
      <UICard>
        <View>
          <MenuTitleText>Используемые ресурсы</MenuTitleText>
          <MenuDescriptionText>
            Для получения фотографий и информации о них используется открытое API проекта PastVu.
            Карта предоставлена Google Maps Platform.
          </MenuDescriptionText>
        </View>
        <MyButton title={'PastVu Api'} func={() => vm.openLink('pastVuAPI')} />
        <MyButton title={'Maps Platform'} func={() => vm.openLink('mapsPlatformAPI')} />
      </UICard>
      <UICard>
        <View>
          <MenuTitleText>Разработчики</MenuTitleText>
          <MenuDescriptionText>
            Персоны участвовавшие в разработке и отладке приложения.
          </MenuDescriptionText>
        </View>
        <MyButton
          title={'Семён Кузьмин • Разработчик'}
          func={() => vm.openLink('telegramDeveloper')}
        />
        <MyButton
          title={'Артём Костюченко • Дизайнер'}
          func={() => vm.openLink('telegramDesigner')}
        />
      </UICard>
    </ScrollContainer>
  )
}

const s = StyleSheet.create({
  block: { width: '100%', alignItems: 'center', gap: 16, marginBottom: 24 },
  image: { width: 128, height: 128, borderRadius: 400 },
})
