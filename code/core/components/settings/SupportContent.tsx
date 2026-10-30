import { FC } from 'react'
import { StyleSheet, Text } from 'react-native'
import { useTheme } from '@react-navigation/native'
import { observer } from 'mobx-react-lite'
import { UICard } from '../ui/UICards'
import { Spacer } from '../ui/Spacer'
import { LinkButtonPair } from './LinkButtonPair'
import { Links } from '../../constants/links'
import { t } from '../../i18n'

/**
 * The support contacts, the same on a phone and a tablet. The screen around them supplies the
 * container and its side margins; `wide` puts the two buttons side by side.
 */
export const SupportContent: FC<{ wide?: boolean }> = observer(({ wide }) => {
  const { colors } = useTheme()
  return (
    <>
      <Spacer height={18} />
      <UICard>
        <Text style={[s.titleText, { color: colors.textFirst }]}>{t('support.title')}</Text>
        <Spacer height={4} />
        <Text style={[s.descriptionText, { color: colors.textSecond }]}>
          {t('support.text')}
        </Text>
        <Spacer height={16} />
        <LinkButtonPair
          wide={wide}
          first={{ title: 'Telegram', url: Links.telegramDeveloper }}
          second={{ title: t('support.email'), url: Links.emailDeveloper }}
        />
      </UICard>
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
})
