import { MyButton } from '../../../../core/components/ui/buttons/MyButton'
import { UICard } from '../../../../core/components/ui/UICards'
import { useTheme } from '@react-navigation/native'
import { Linking, StyleSheet, Text, View } from 'react-native'
import { Spacer } from '../../../../core/components/ui/Spacer'
import { Links } from '../../../../core/constants/links'
import { Container } from '../../../../core/components/ui/Container'
import { t } from '../../../../core/i18n'
import { observer } from 'mobx-react-lite'

export const SupportContactsScreen = observer(() => {
  const { colors } = useTheme()
  return (
    <Container style={s.container}>
      <Spacer height={18} />
      <UICard>
        <Text style={[s.titleText, { color: colors.textFirst }]}>{t('support.title')}</Text>
        <Spacer height={4} />
        <Text style={[s.descriptionText, { color: colors.textSecond }]}>
          {t('support.text')}
        </Text>
        <Spacer height={16} />
        <View style={s.row}>
          <MyButton
            title={'Telegram'}
            func={() => Linking.openURL(Links.telegramDeveloper)}
            fullWidth
          />
          <MyButton title={t('support.email')} func={() => Linking.openURL(Links.emailDeveloper)} fullWidth />
        </View>
      </UICard>
    </Container>
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
  row: { flexDirection: 'row', gap: 12 },
  container: { paddingRight: 48, paddingLeft: 32 },
})
