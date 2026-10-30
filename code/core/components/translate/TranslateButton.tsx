import { FC } from 'react'
import { Alert, View } from 'react-native'
import { observer } from 'mobx-react-lite'
import { useTheme } from '@react-navigation/native'
import { HeaderIconButton } from '../ui/buttons/HeaderIconButton'
import TranslationStore, { photoTranslationId } from '../../store/Translation.store'
import { t } from '../../i18n'

type Props = {
  cid: string | number
  title: string
  desc?: string | null
  /** The space after the button: the header's gap between its buttons. */
  gap?: number
}

/**
 * Whether the header shows the translate button for this photo: its title or its description is
 * in a language other than the app's. Kept while a translation is on its way, shown or failed, so
 * the way back never disappears. The phone header spaces its buttons by it.
 */
export const showsTranslateButton = (cid: string | number, title: string, desc?: string | null) =>
  TranslationStore.photoDiffers(title, desc) ||
  TranslationStore.state(photoTranslationId(cid)) !== 'original'

/**
 * The header's translate button for a photo's title and description, followed by the gap to the
 * next button. Highlighted while the translation is shown; greyed out while it is on its way, as
 * the text itself shows the progress.
 */
export const TranslateButton: FC<Props> = observer(({ cid, title, desc, gap = 4 }) => {
  const { colors } = useTheme()
  if (!showsTranslateButton(cid, title, desc)) return null
  const id = photoTranslationId(cid)
  const state = TranslationStore.state(id)
  const loading = state === 'loading'
  const translated = state === 'translated'
  const toggle = async () => {
    // Only what is in another language goes to Google; the rest stays as it is and costs nothing.
    const done = await TranslationStore.toggle(id, [
      TranslationStore.differsFromApp(title) ? title : '',
      desc && TranslationStore.differsFromApp(desc) ? desc : '',
    ])
    if (done) return
    Alert.alert(
      t('common.error'),
      TranslationStore.failure(id) === 'dayLimit' ? t('translate.dayLimit') : t('translate.error'),
    )
  }
  return (
    <View style={{ marginRight: gap }}>
      <HeaderIconButton
        name="translate"
        color={translated ? colors.basePrimary : loading ? colors.textThird : colors.textFirst}
        onPress={toggle}
        disabled={loading}
        accessibilityLabel={
          translated
            ? t('translate.hide')
            : loading
              ? t('translate.loading')
              : t('translate.button')
        }
      />
    </View>
  )
})
