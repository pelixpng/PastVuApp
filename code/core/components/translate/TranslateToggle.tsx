import { FC } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { observer } from 'mobx-react-lite'
import { useTheme } from '@react-navigation/native'
import TranslationStore, { TranslationState } from '../../store/Translation.store'
import { GoogleAttribution } from './GoogleAttribution'
import { t } from '../../i18n'

type Props = {
  /** The item's translation id, e.g. `commentTranslationId(comment.cid)`. */
  id: string
  /** The comment's original HTML: its language decides whether the link shows. */
  html: string
}

const label = (state: TranslationState, dayLimit: boolean) => {
  switch (state) {
    case 'loading':
      return t('translate.loading')
    case 'translated':
      return t('translate.hide')
    case 'failed':
      return dayLimit
        ? t('translate.dayLimit')
        : `${t('translate.failed')} · ${t('translate.retry')}`
    default:
      return t('translate.show')
  }
}

/**
 * The quiet link under a comment, as on Instagram: "Translate with Google", then "Show original"
 * beside Google's badge, which its terms require next to every translation.
 *
 * Shown only on comments in a language other than the app's, and kept while a translation is on
 * its way, shown or failed, so the way back never disappears. A press while loading does nothing,
 * since it would only cancel the request the first one started, but the link still takes it: a
 * disabled Pressable lets the touch through, and in a profile the comment's row would open the
 * photo.
 */
export const TranslateToggle: FC<Props> = observer(({ id, html }) => {
  const { colors } = useTheme()
  const state = TranslationStore.state(id)
  if (state === 'original' && !TranslationStore.differsFromApp(html)) return null
  const loading = state === 'loading'
  const dayLimit = TranslationStore.failure(id) === 'dayLimit'
  return (
    <View style={s.row}>
      <Pressable
        onPress={loading ? undefined : () => TranslationStore.toggle(id, [html])}
        accessibilityRole="button"
        accessibilityState={{ disabled: loading, busy: loading }}
        hitSlop={HIT_SLOP}
        style={({ pressed }) => [s.link, pressed && !loading && s.pressed]}>
        <Text style={[s.text, { color: colors.textThird }]}>{label(state, dayLimit)}</Text>
      </Pressable>
      {state === 'translated' && (
        <>
          <Text style={[s.text, { color: colors.textThird }]}>·</Text>
          <GoogleAttribution height={BADGE_HEIGHT} />
        </>
      )}
    </View>
  )
})

/** The badge's "translated by" then reads about as large as the 12 pt link beside it. */
const BADGE_HEIGHT = 15

// A comfortable target for 12 pt text, but little of it above: the comment's last line, with its
// links, is only a few points away.
const HIT_SLOP = { top: 4, bottom: 8, left: 8, right: 16 }

const s = StyleSheet.create({
  // A clear step below the comment's last line, as on Instagram: the comment's <p> brings no margin
  // of its own here. Only as wide as its contents: the rest of the row stays free.
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexWrap: 'wrap',
    columnGap: 6,
    rowGap: 4,
    marginTop: 6,
  },
  link: { alignSelf: 'flex-start' },
  text: { fontSize: 12, lineHeight: 16, fontWeight: '600' },
  pressed: { opacity: 0.5 },
})
