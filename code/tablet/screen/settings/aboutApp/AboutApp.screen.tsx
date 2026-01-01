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
    <Container isScroll style={s.container}>
      <Spacer height={4} />
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
        <View style={s.row}>
          <MyButton
            fullWidth
            title={'Web версия PastVu'}
            func={() => Linking.openURL(Links.telegramDesigner)}
          />
          <MyButton
            fullWidth
            title={'GitHub приложения'}
            func={() => Linking.openURL(Links.sourceCode)}
          />
        </View>
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
        <View style={s.row}>
          <MyButton
            fullWidth
            title={'Maps Platform'}
            func={() => Linking.openURL(Links.mapsPlatformAPI)}
          />
          <MyButton fullWidth title={'LocationIQ'} func={() => Linking.openURL(Links.locationIq)} />
        </View>
      </UICard>
      <Spacer height={16} />
      <UICard>
        <Text style={[s.titleText, { color: colors.textFirst }]}>Разработчики</Text>
        <Spacer height={4} />
        <Text style={[s.descriptionText, { color: colors.textSecond }]}>
          Персоны участвовавшие в разработке и отладке приложения.
        </Text>
        <Spacer height={16} />
        <View style={s.row}>
          <MyButton
            fullWidth
            title={'Семён Кузьмин • Разработчик'}
            func={() => Linking.openURL(Links.telegramDeveloper)}
          />
          <MyButton
            fullWidth
            title={'Артём Костюченко • Дизайнер'}
            func={() => Linking.openURL(Links.telegramDesigner)}
          />
        </View>
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  container: { paddingRight: 48, paddingLeft: 32 },
})
