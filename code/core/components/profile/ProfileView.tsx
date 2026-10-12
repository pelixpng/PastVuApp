import { FC, Fragment } from 'react'
import { ActivityIndicator, Linking, StyleSheet, Text, View } from 'react-native'
import { Image } from 'expo-image'
import { useTheme } from '@react-navigation/native'
import { CustomTheme } from '../theme/Theme'
import { observer } from 'mobx-react-lite'
import StandardAvatar from '../../../assets/avatar.png'
import { formatLongDate, t, TranslationKey } from '../../i18n'
import { formatNumber } from '../../utils/formatNumber'
import { UserProfile } from '../../types/apiUserProfile'
import { Spacer } from '../ui/Spacer'
import { HeaderIconButton } from '../ui/buttons/HeaderIconButton'
import { PagedListState, ProfileState } from '../../services/userProfile'

const SITE = 'https://pastvu.com'

// Split with a capturing group keeps the links at the odd indices of the result.
const URL_PATTERN = /((?:https?:\/\/|www\.)[^\s<>"']+)/i
const openLink = (url: string) => {
  const trimmed = url.replace(/[.,;:!?)]+$/, '')
  Linking.openURL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`)
}

/** A plural phrase such as "28 407 comments", with the number grouped the way the language writes it. */
const countPhrase = (key: TranslationKey, count: number) => {
  // i18n-js prints the bare number; only the digits change, so the plural form stays right.
  return t(key, { count }).replace(String(count), formatNumber(count))
}

const formatRegistration = (iso?: string) => {
  if (!iso) return undefined
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? undefined : formatLongDate(date)
}

type Row = { label: TranslationKey; value?: string; kind?: 'link' | 'text' }

type BadgeColors = { text: string; background: string }

// The counts get their own colours so they read apart from the role, which keeps the app's blue.
const COUNT_COLORS: Record<'light' | 'dark', { photos: BadgeColors; comments: BadgeColors }> = {
  light: {
    photos: { text: '#1F9D55', background: '#E3F5EA' },
    comments: { text: '#D97A1E', background: '#FCEFE2' },
  },
  dark: {
    photos: { text: '#4CC27E', background: '#1C2A22' },
    comments: { text: '#F2A254', background: '#2D2217' },
  },
}

const Badge: FC<{ text: string; colors: BadgeColors }> = ({ text, colors }) => (
  <Text style={[s.badge, { color: colors.text, backgroundColor: colors.background }]}>{text}</Text>
)

const LinkedText: FC<{ text: string; color: string; linkColor: string }> = ({
  text,
  color,
  linkColor,
}) => (
  <Text selectable style={[s.value, { color }]}>
    {text.split(URL_PATTERN).map((part, index) =>
      index % 2 === 1 ? (
        <Text key={index} style={{ color: linkColor }} onPress={() => openLink(part)}>
          {part}
        </Text>
      ) : (
        <Fragment key={index}>{part}</Fragment>
      ),
    )}
  </Text>
)

type ProfileSummaryProps = {
  profile: UserProfile
  /** A share button beside the name, where the screen header has no room for it (tablet). */
  onShare?: () => void
}

/** The top of a profile page: avatar, names, counts, role, and the fields the user filled in. */
export const ProfileSummary: FC<ProfileSummaryProps> = observer(({ profile, onShare }) => {
  const theme = useTheme() as CustomTheme
  const { colors } = theme
  const countColors = COUNT_COLORS[theme.names?.themeName === 'dark' ? 'dark' : 'light']
  const realName = [profile.firstName, profile.lastName].filter(Boolean).join(' ')
  const role =
    profile.role > 9 ? t('profile.admin') : profile.role > 4 ? t('profile.moderator') : null
  // Same fields and order as the profile tab on the site, which also skips the empty ones.
  const rows: Row[] = [
    { label: 'profile.registered', value: formatRegistration(profile.regdate) },
    { label: 'profile.realName', value: realName !== profile.disp ? realName : undefined },
    { label: 'profile.birthdate', value: profile.birthdate },
    {
      label: 'profile.sex',
      value:
        profile.sex === 'm'
          ? t('profile.male')
          : profile.sex === 'f'
            ? t('profile.female')
            : undefined,
    },
    {
      label: 'profile.location',
      value: [profile.country, profile.city].filter(Boolean).join(', ') || undefined,
    },
    { label: 'profile.occupation', value: profile.work },
    { label: 'profile.website', value: profile.www, kind: 'link' },
    { label: 'profile.about', value: profile.aboutme, kind: 'text' },
  ]

  return (
    <View>
      <View style={s.header}>
        <Image
          source={profile.avatar ? { uri: `${SITE}/_a/d/${profile.avatar}` } : StandardAvatar}
          style={s.avatar}
          cachePolicy="disk"
        />
        <Spacer width={16} />
        <View style={s.headerText}>
          <Text selectable style={[s.name, { color: colors.textFirst }]}>
            {profile.disp}
          </Text>
          {profile.disp !== profile.login && (
            <Text selectable style={[s.login, { color: colors.textThird }]}>
              {profile.login}
            </Text>
          )}
          <View style={s.badges}>
            <Badge
              text={countPhrase('profile.photosCount', profile.pcount)}
              colors={countColors.photos}
            />
            <Badge
              text={countPhrase('photo.commentsCount', profile.ccount)}
              colors={countColors.comments}
            />
            {role && (
              <Badge
                text={role}
                colors={{ text: colors.basePrimary, background: colors.selectedItem }}
              />
            )}
            {profile.online && (
              <View style={s.online}>
                <View style={s.onlineDot} />
                <Spacer width={4} />
                <Text style={[s.onlineText, { color: colors.textSecond }]}>
                  {t('profile.online')}
                </Text>
              </View>
            )}
          </View>
        </View>
        {onShare && (
          <View style={s.share}>
            <HeaderIconButton name="share" color={colors.textFirst} onPress={onShare} />
          </View>
        )}
      </View>
      {rows
        .filter(row => row.value)
        .map(row => (
          <View key={row.label} style={s.row}>
            <Text style={[s.label, { color: colors.textThird }]}>{t(row.label)}</Text>
            <Spacer height={2} />
            {row.kind === 'link' ? (
              <Text
                style={[s.value, { color: colors.basePrimary }]}
                onPress={() => openLink(row.value!)}>
                {row.value}
              </Text>
            ) : row.kind === 'text' ? (
              <LinkedText
                text={row.value!}
                color={colors.textFirst}
                linkColor={colors.basePrimary}
              />
            ) : (
              <Text selectable style={[s.value, { color: colors.textFirst }]}>
                {row.value}
              </Text>
            )}
          </View>
        ))}
    </View>
  )
})

/** Fills the screen while the profile loads, or says why it could not be shown. */
export const ProfileStatus: FC<{ state: ProfileState; onRetry: () => void }> = observer(
  ({ state, onRetry }) => {
    const { colors } = useTheme()
    if (state.status === 'loading' || state.status === 'ready') {
      return (
        <View style={s.center}>
          <ActivityIndicator color={colors.textThird} />
        </View>
      )
    }
    return (
      <View style={s.center}>
        <Text style={[s.message, { color: colors.textSecond }]}>
          {t(state.status === 'notFound' ? 'profile.notFound' : 'profile.loadError')}
        </Text>
        {state.status === 'error' && (
          <Text style={[s.retry, { color: colors.basePrimary }]} onPress={onRetry}>
            {t('common.retry')}
          </Text>
        )}
      </View>
    )
  },
)

type ListFooterProps = {
  list: PagedListState
  emptyText: string
  errorText: string
}

/** Under a profile list: the next page loading, a failed page with a retry, or an empty list. */
export const ProfileListFooter: FC<ListFooterProps> = observer(({ list, emptyText, errorText }) => {
  const { colors } = useTheme()
  if (list.loading) {
    return (
      <View style={s.footer}>
        <ActivityIndicator color={colors.textThird} />
      </View>
    )
  }
  if (list.failed) {
    return (
      <View style={s.footer}>
        <Text style={[s.message, { color: colors.textSecond }]}>{errorText}</Text>
        <Text style={[s.retry, { color: colors.basePrimary }]} onPress={list.loadMore}>
          {t('common.retry')}
        </Text>
      </View>
    )
  }
  if (list.isEmpty) {
    return (
      <View style={s.footer}>
        <Text style={[s.message, { color: colors.textThird }]}>{emptyText}</Text>
      </View>
    )
  }
  return null
})

const s = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  footer: { alignItems: 'center', paddingVertical: 24 },
  message: { fontSize: 15, lineHeight: 20, fontWeight: '500', textAlign: 'center' },
  retry: { fontSize: 16, fontWeight: '600', marginTop: 12 },
  header: { flexDirection: 'row', alignItems: 'center' },
  // 44 pt box around a 24 pt glyph: pull in by 10 so the glyph lines up with the text edge.
  share: { alignSelf: 'flex-start', marginRight: -10 },
  // The site serves avatars at 100 px, so they stay sharp up to about this size.
  avatar: { width: 72, height: 72, borderRadius: 36 },
  headerText: { flex: 1 },
  name: { fontSize: 20, lineHeight: 24, fontWeight: '800' },
  login: { fontSize: 13, lineHeight: 20, fontWeight: '500' },
  // A little further from the name than the login line, so the badges read as their own row.
  badges: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginTop: 10 },
  badge: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  online: { flexDirection: 'row', alignItems: 'center' },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#34C759' },
  onlineText: { fontSize: 13, lineHeight: 16, fontWeight: '500' },
  row: { marginTop: 16 },
  label: { fontSize: 13, lineHeight: 18, fontWeight: '500' },
  value: { fontSize: 15, lineHeight: 20 },
})
