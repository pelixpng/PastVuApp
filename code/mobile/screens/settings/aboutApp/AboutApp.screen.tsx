import { Image, View, StyleSheet, Text, Linking } from 'react-native'
import { MyButton } from '../../../../core/components/ui/buttons/MyButton'
import { Container } from '../../../../core/components/ui/Container'
import { useTheme } from '@react-navigation/native'
import { UICard } from '../../../../core/components/ui/UICards'
import { Spacer } from '../../../../core/components/ui/Spacer'
import { Links } from '../../../../core/constants/links'
import { formatLongDate, t } from '../../../../core/i18n'
import { observer } from 'mobx-react-lite'

const APP_VERSION = '2.6.1'
const RELEASE_DATE = new Date('2026-09-22')

export const AboutAppScreen = observer(() => {
  const { colors } = useTheme()
  return (
    <Container isScroll pdHorizontal={16}>
      <Spacer height={18} />
      <View style={s.block}>
        <Image style={s.image} source={require('../../../../assets/iconAbout.png')} />
        <Spacer height={16} />
        <Text selectable style={[s.descriptionText, { color: colors.textSecond }]}>
          {t('about.version', { version: APP_VERSION, date: formatLongDate(RELEASE_DATE) })}
        </Text>
      </View>
      <Spacer height={24} />
      <UICard>
        <Text style={[s.titleText, { color: colors.textFirst }]}>{t('about.whatIsTitle')}</Text>
        <Spacer height={4} />
        <Text style={[s.descriptionText, { color: colors.textSecond }]}>
          {t('about.whatIsText')}
        </Text>
        <Spacer height={16} />
        <MyButton title={t('about.telegramChannel')} func={() => Linking.openURL(Links.telegramChanel)} />
        <Spacer height={16} />
        <MyButton title={t('about.aboutPastVu')} func={() => Linking.openURL(Links.aboutPastVu)} />
        <Spacer height={16} />
        <MyButton title={t('about.webVersion')} func={() => Linking.openURL(Links.webPastVu)} />
        <Spacer height={16} />
        <MyButton title={t('about.github')} func={() => Linking.openURL(Links.sourceCode)} />
      </UICard>
      <Spacer height={16} />
      <UICard>
        <Text style={[s.titleText, { color: colors.textFirst }]}>{t('about.creditsTitle')}</Text>
        <Spacer height={4} />
        <Text style={[s.descriptionText, { color: colors.textSecond }]}>
          {t('about.creditsText')}
        </Text>
        <Spacer height={16} />
        <MyButton title={'PastVu API'} func={() => Linking.openURL(Links.pastVuAPI)} />
        <Spacer height={16} />
        <MyButton title={'Maps Platform'} func={() => Linking.openURL(Links.mapsPlatformAPI)} />
        <Spacer height={16} />
        <MyButton title={'LocationIQ'} func={() => Linking.openURL(Links.locationIq)} />
        <Spacer height={16} />
        <MyButton title={'Google Street View'} func={() => Linking.openURL(Links.streetView)} />
        <Spacer height={16} />
        <MyButton title={'Yandex Maps'} func={() => Linking.openURL(Links.yandexMaps)} />
      </UICard>
      <Spacer height={16} />
      <UICard>
        <Text style={[s.titleText, { color: colors.textFirst }]}>{t('about.teamTitle')}</Text>
        <Spacer height={4} />
        <Text style={[s.descriptionText, { color: colors.textSecond }]}>
          {t('about.teamText')}
        </Text>
        <Spacer height={16} />
        <MyButton
          title={t('about.developer')}
          func={() => Linking.openURL(Links.telegramDeveloper)}
        />
        <Spacer height={16} />
        <MyButton
          title={t('about.designer')}
          func={() => Linking.openURL(Links.telegramDesigner)}
        />
      </UICard>
      <Spacer height={16} />
    </Container>
  )
})

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
