import { FC } from 'react'
import { Image, View, StyleSheet, Text, Linking } from 'react-native'
import { useTheme } from '@react-navigation/native'
import { observer } from 'mobx-react-lite'
import { MyButton } from '../ui/buttons/MyButton'
import { UICard } from '../ui/UICards'
import { Spacer } from '../ui/Spacer'
import { TranslationNotice } from '../translate/TranslationNotice'
import { LinkButtonPair } from './LinkButtonPair'
import { Links } from '../../constants/links'
import { formatLongDate, t } from '../../i18n'

const APP_VERSION = '2.9.0'
const RELEASE_DATE = new Date('2026-10-28')

/**
 * The About section, the same on a phone and a tablet. The screen around it supplies the scrolling
 * container and its side margins; `wide` puts related buttons side by side.
 */
export const AboutContent: FC<{ wide?: boolean }> = observer(({ wide }) => {
  const { colors } = useTheme()
  return (
    <>
      <Spacer height={18} />
      <View style={s.block}>
        <Image style={s.image} source={require('../../../assets/iconAbout.png')} />
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
        <LinkButtonPair
          wide={wide}
          first={{ title: t('about.webVersion'), url: Links.webPastVu }}
          second={{ title: t('about.github'), url: Links.sourceCode }}
        />
        <Spacer height={16} />
        <MyButton title={t('about.privacyPolicy')} func={() => Linking.openURL(Links.privacyPolicy)} />
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
        <LinkButtonPair
          wide={wide}
          first={{ title: 'Maps Platform', url: Links.mapsPlatformAPI }}
          second={{ title: 'LocationIQ', url: Links.locationIq }}
        />
        <Spacer height={16} />
        <LinkButtonPair
          wide={wide}
          first={{ title: 'Google Street View', url: Links.streetView }}
          second={{ title: 'Yandex Maps', url: Links.yandexMaps }}
        />
        <Spacer height={16} />
        <MyButton title={t('about.yandexTerms')} func={() => Linking.openURL(Links.yandexTerms)} />
        <Spacer height={16} />
        <MyButton title={'DDColor'} func={() => Linking.openURL(Links.ddcolor)} />
      </UICard>
      <Spacer height={16} />
      {/* Google's terms: the help says Google Translate translates, with its disclaimer. */}
      <TranslationNotice />
      <UICard>
        <Text style={[s.titleText, { color: colors.textFirst }]}>{t('about.teamTitle')}</Text>
        <Spacer height={4} />
        <Text style={[s.descriptionText, { color: colors.textSecond }]}>
          {t('about.teamText')}
        </Text>
        <Spacer height={16} />
        <LinkButtonPair
          wide={wide}
          first={{ title: t('about.developer'), url: Links.telegramDeveloper }}
          second={{ title: t('about.designer'), url: Links.telegramDesigner }}
        />
      </UICard>
      <Spacer height={16} />
    </>
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
