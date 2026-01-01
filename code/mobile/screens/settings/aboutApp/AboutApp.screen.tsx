import { Image, View, StyleSheet, Text, Linking } from 'react-native'
import { MyButton } from '../../../../core/components/ui/buttons/MyButton'
import { Container } from '../../../../core/components/ui/Container'
import { useTheme } from '@react-navigation/native'
import { UICard } from '../../../../core/components/ui/UICards'
import { Spacer } from '../../../../core/components/ui/Spacer'
import { Links } from '../../../../core/constants/links'

export const AboutAppScreen = () => {
  const { colors } = useTheme()
  return (
    <Container isScroll pdHorizontal={16}>
      <Spacer height={18} />
      <View style={s.block}>
        <Image style={s.image} source={require('../../../../assets/icon.png')} />
        <Spacer height={16} />
        <Text selectable style={[s.descriptionText, { color: colors.textSecond }]}>
          Версия 2.3.0 от 22 декабря 2025 г.
        </Text>
      </View>
      <Spacer height={24} />
      <UICard>
        <Text style={[s.titleText, { color: colors.textFirst }]}>Что такое PastVu?</Text>
        <Spacer height={4} />
        <Text style={[s.descriptionText, { color: colors.textSecond }]}>
          Данное приложение является мобильной версией проекта PastVu, а также имеет полностью
          открытый исходный код. PastVu - проект по сбору свидетельств прошлого в фотографиях,
          взгляд на историю среды обитания человечества.
        </Text>
        <Spacer height={16} />
        <MyButton title={'Наш Telegram канал'} func={() => Linking.openURL(Links.telegramChanel)} />
        <Spacer height={16} />
        <MyButton title={'О проекте PastVu'} func={() => Linking.openURL(Links.aboutPastVu)} />
        <Spacer height={16} />
        <MyButton title={'Web версия PastVu'} func={() => Linking.openURL(Links.webPastVu)} />
        <Spacer height={16} />
        <MyButton title={'GitHub приложения'} func={() => Linking.openURL(Links.sourceCode)} />
      </UICard>
      <Spacer height={16} />
      <UICard>
        <Text style={[s.titleText, { color: colors.textFirst }]}>Используемые ресурсы</Text>
        <Spacer height={4} />
        <Text style={[s.descriptionText, { color: colors.textSecond }]}>
          Для получения фотографий и информации о них используется открытое API проекта PastVu. Для
          поиска мест используется сервис LocationIQ. На Android карта отображается через Google
          Maps Platform, на iOS — через Apple Maps.
        </Text>
        <Spacer height={16} />
        <MyButton title={'PastVu API'} func={() => Linking.openURL(Links.pastVuAPI)} />
        <Spacer height={16} />
        <MyButton title={'Maps Platform'} func={() => Linking.openURL(Links.mapsPlatformAPI)} />
        <Spacer height={16} />
        <MyButton title={'LocationIQ'} func={() => Linking.openURL(Links.locationIq)} />
      </UICard>
      <Spacer height={16} />
      <UICard>
        <Text style={[s.titleText, { color: colors.textFirst }]}>Разработчики</Text>
        <Spacer height={4} />
        <Text style={[s.descriptionText, { color: colors.textSecond }]}>
          Персоны участвовавшие в разработке и отладке приложения.
        </Text>
        <Spacer height={16} />
        <MyButton
          title={'Семён Кузьмин • Разработчик'}
          func={() => Linking.openURL(Links.telegramDeveloper)}
        />
        <Spacer height={16} />
        <MyButton
          title={'Артём Костюченко • Дизайнер'}
          func={() => Linking.openURL(Links.telegramDesigner)}
        />
      </UICard>
      <Spacer height={16} />
    </Container>
  )
}

const s = StyleSheet.create({
  block: { width: '100%', alignItems: 'center' },
  image: { width: 128, height: 128, borderRadius: 400 },
  descriptionText: {
    fontWeight: '400',
    fontSize: 13,
    lineHeight: 20,
  },
  titleText: {
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '800',
  },
})
