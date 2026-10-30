import { FC } from 'react'
import { Linking, StyleSheet, Text } from 'react-native'
import { useTheme } from '@react-navigation/native'
import { observer } from 'mobx-react-lite'
import { UICard } from '../ui/UICards'
import { Spacer } from '../ui/Spacer'
import { MyButton } from '../ui/buttons/MyButton'
import { Links } from '../../constants/links'
import { TRANSLATION_AVAILABLE } from '../../services/translate'
import { t } from '../../i18n'

/**
 * Google's own wording, which its terms require apps showing unedited translations to make
 * available; kept in English, as Google publishes it.
 */
const GOOGLE_DISCLAIMER =
  'THIS SERVICE MAY CONTAIN TRANSLATIONS POWERED BY GOOGLE. GOOGLE DISCLAIMS ALL WARRANTIES ' +
  'RELATED TO THE TRANSLATIONS, EXPRESS OR IMPLIED, INCLUDING ANY WARRANTIES OF ACCURACY, ' +
  'RELIABILITY, AND ANY IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE ' +
  'AND NONINFRINGEMENT.'

/**
 * The About screen's card on translation: Google's terms want the app's help to say that Google
 * Translate does it, link the Cloud Translation site and carry Google's disclaimer. Absent from a
 * build without the translation key, which translates nothing.
 */
export const TranslationNotice: FC = observer(() => {
  const { colors } = useTheme()
  if (!TRANSLATION_AVAILABLE) return null
  return (
    <>
      <UICard>
        <Text style={[s.titleText, { color: colors.textFirst }]}>
          {t('about.translationTitle')}
        </Text>
        <Spacer height={4} />
        <Text style={[s.descriptionText, { color: colors.textSecond }]}>
          {t('about.translationText')}
        </Text>
        <Spacer height={8} />
        <Text selectable style={[s.disclaimerText, { color: colors.textThird }]}>
          {GOOGLE_DISCLAIMER}
        </Text>
        <Spacer height={16} />
        <MyButton
          title={'Cloud Translation API'}
          func={() => Linking.openURL(Links.cloudTranslation)}
        />
      </UICard>
      <Spacer height={16} />
    </>
  )
})

const s = StyleSheet.create({
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
  disclaimerText: {
    fontWeight: '400',
    fontSize: 11,
    lineHeight: 16,
  },
})
