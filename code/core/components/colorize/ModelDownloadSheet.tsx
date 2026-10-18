import { FC, useEffect } from 'react'
import {
  ActivityIndicator,
  Modal,
  ModalProps,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { observer } from 'mobx-react-lite'
import { useTheme } from '@react-navigation/native'
import {
  SafeAreaProvider,
  useSafeAreaInsets
} from 'react-native-safe-area-context'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated'
import { scheduleOnRN } from 'react-native-worklets'
import { MaterialIcons } from '../ui/icons'
import { MyButton } from '../ui/buttons/MyButton'
import { Spacer } from '../ui/Spacer'
import ColorizerModel, {
  MODEL_DOWNLOAD,
  SPACE_NEEDED
} from '../../store/ColorizerModel.store'
import { t } from '../../i18n'

/** Megabytes as iOS shows them (1000², not 1024²), so the figure matches the storage settings. */
const megabytes = (bytes: number) => Math.round(bytes / 1_000_000)
const MODEL_MB = megabytes(MODEL_DOWNLOAD.bytes)
/** The free space the download checks for, rounded up to 50 MB: 700 on iOS, 500 on Android. */
const NEEDED_MB = Math.ceil(SPACE_NEEDED / 50_000_000) * 50
const SHEET_TRAVEL = 400
const ALL_ORIENTATIONS: ModalProps['supportedOrientations'] = [
  'portrait',
  'portrait-upside-down',
  'landscape-left',
  'landscape-right',
]

/**
 * The one-time download of the colorization model, opened by the palette while the model is
 * missing. Mounted once at the app's root. It can close while downloading: the download goes on,
 * and the palette opens it again with the progress.
 */
export const ModelDownloadSheet: FC = observer(() => (
  <Modal
    visible={ColorizerModel.sheetVisible}
    transparent
    animationType="none"
    // A modal is portrait-only by default on iOS, which would turn the landscape iPad app around.
    supportedOrientations={ALL_ORIENTATIONS}
    onRequestClose={ColorizerModel.hideSheet}>
    {/* The sheet sits above the navigator, outside any safe-area provider, so it brings its own. */}
    <SafeAreaProvider>
      <Sheet />
    </SafeAreaProvider>
  </Modal>
))

const Sheet: FC = observer(() => {
  const { colors } = useTheme()
  const { bottom } = useSafeAreaInsets()
  const visible = ColorizerModel.sheetVisible
  const translateY = useSharedValue(SHEET_TRAVEL)
  const opacity = useSharedValue(0)

  useEffect(() => {
    if (!visible) return
    opacity.value = withTiming(1, { duration: 200 })
    translateY.value = withTiming(0, { duration: 250 })
  }, [visible, opacity, translateY])

  const close = () => {
    // Just the function: the worklet below runs on the UI thread, which cannot take the store.
    const hideSheet = ColorizerModel.hideSheet
    opacity.value = withTiming(0, { duration: 200 })
    translateY.value = withTiming(SHEET_TRAVEL, { duration: 250 }, finished => {
      if (finished) scheduleOnRN(hideSheet)
    })
  }

  const overlayStyle = useAnimatedStyle(() => ({ opacity: opacity.value }))
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }]
  }))

  const { phase, failure, progress } = ColorizerModel
  let body
  switch (phase) {
    case 'missing':
      body = (
        <>
          <Disclaimer />
          <MyButton
            title={t('colorizeModel.download', { size: MODEL_MB })}
            func={ColorizerModel.start}
          />
          <TextButton
            title={t('common.cancel')}
            onPress={close}
            color={colors.textFirst}
          />
        </>
      )
      break
    case 'downloading':
      body = (
        <>
          <View style={[s.track, { backgroundColor: colors.baseFourth }]}>
            <View
              style={[
                s.fill,
                {
                  backgroundColor: colors.basePrimary,
                  width: `${progress * 100}%`
                }
              ]}
            />
          </View>
          <Spacer height={8} />
          <View style={s.row}>
            <Text style={[s.small, { color: colors.textFirst }]}>
              {t('colorizeModel.downloading', {
                percent: Math.floor(progress * 100)
              })}
            </Text>
            <Text style={[s.small, { color: colors.textSecond }]}>
              {t('colorizeModel.downloaded', {
                done: Math.round(progress * MODEL_MB),
                total: MODEL_MB
              })}
            </Text>
          </View>
          <Spacer height={12} />
          <Text style={[s.hint, { color: colors.textSecond }]}>
            {t('colorizeModel.backgroundHint')}
          </Text>
          <TextButton
            title={t('colorizeModel.stop')}
            onPress={ColorizerModel.cancel}
            color={colors.textFirst}
          />
        </>
      )
      break
    case 'installing':
      body = (
        <View style={s.installing}>
          <ActivityIndicator color={colors.textFirst} />
          <Spacer width={10} />
          <Text style={[s.small, { color: colors.textFirst }]}>
            {t('colorizeModel.installing')}
          </Text>
        </View>
      )
      break
    case 'ready':
      body = (
        <>
          <Text style={[s.message, { color: colors.textFirst }]}>
            {t('colorizeModel.ready')}
          </Text>
          <Spacer height={8} />
          <Text style={[s.description, { color: colors.textSecond }]}>
            {t('colorizeModel.settingsHint')}
          </Text>
          <Spacer height={16} />
          <MyButton title={t('colorizeModel.close')} func={close} />
        </>
      )
      break
    case 'failed':
      body = (
        <>
          <Text style={[s.message, { color: colors.textFirst }]}>
            {failure === 'space'
              ? t('colorizeModel.errorSpace', { size: NEEDED_MB })
              : failure === 'install'
                ? t('colorizeModel.errorInstall')
                : t('colorizeModel.errorNetwork')}
          </Text>
          <Spacer height={16} />
          <Disclaimer />
          <MyButton
            title={t('colorizeModel.retry')}
            func={ColorizerModel.start}
          />
          <TextButton
            title={t('colorizeModel.close')}
            onPress={close}
            color={colors.textFirst}
          />
        </>
      )
      break
  }

  return (
    <Animated.View style={[s.overlay, overlayStyle]}>
      {/* Installing cannot be stopped halfway, so the sheet stays until it is done. */}
      <Pressable
        style={s.flex}
        onPress={phase === 'installing' ? undefined : close}
      />
      <Animated.View
        style={[
          s.sheet,
          { backgroundColor: colors.baseSecond, paddingBottom: bottom + 16 },
          sheetStyle
        ]}
      >
        <View style={s.heading}>
          <MaterialIcons name="palette" size={28} color={colors.basePrimary} />
          <Spacer width={10} />
          <Text style={[s.title, { color: colors.textFirst }]}>
            {t('colorizeModel.title')}
          </Text>
        </View>
        <Spacer height={12} />
        {phase !== 'ready' && phase !== 'failed' && (
          <>
            <Text style={[s.description, { color: colors.textSecond }]}>
              {t('colorizeModel.description', { size: MODEL_MB })}
            </Text>
            <Spacer height={8} />
            <Text style={[s.description, { color: colors.textSecond }]}>
              {t('colorizeModel.settingsHint')}
            </Text>
            <Spacer height={20} />
          </>
        )}
        {body}
      </Animated.View>
    </Animated.View>
  )
})

/**
 * Warns before the download that AI colorization is for entertainment only. A card above the
 * download button, followed by the gap before it: a short title that reads at a glance, then the
 * explanation at the description's size. Tinted with the button's blue, so it reads as a note
 * rather than an error, in both themes.
 */
const Disclaimer: FC = () => {
  const { colors } = useTheme()
  return (
    <>
      <View style={[s.notice, { backgroundColor: `${colors.basePrimary}1A` }]}>
        <View style={s.noticeHeader}>
          <MaterialIcons name="info" size={20} color={colors.basePrimary} />
          <Spacer width={8} />
          <Text style={[s.noticeTitle, { color: colors.textFirst }]}>
            {t('colorizeModel.disclaimerTitle')}
          </Text>
        </View>
        <Spacer height={6} />
        <Text style={[s.description, { color: colors.textSecond }]}>
          {t('colorizeModel.disclaimer')}
        </Text>
      </View>
      <Spacer height={20} />
    </>
  )
}

const TextButton: FC<{ title: string; onPress: () => void; color: string }> = ({
  title,
  onPress,
  color
}) => (
  <TouchableOpacity style={s.textButton} onPress={onPress} activeOpacity={0.7}>
    <Text style={[s.textButtonLabel, { color }]}>{title}</Text>
  </TouchableOpacity>
)

const s = StyleSheet.create({
  flex: { flex: 1 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end'
  },
  // Full width on a phone; on the iPad a column of phone width, centred.
  sheet: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingHorizontal: 24
  },
  heading: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: 18, lineHeight: 24, fontWeight: '800', flexShrink: 1 },
  description: { fontSize: 14, lineHeight: 20, fontWeight: '500' },
  message: { fontSize: 15, lineHeight: 21, fontWeight: '600' },
  track: { height: 6, borderRadius: 3, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  small: { fontSize: 13, lineHeight: 18, fontWeight: '600' },
  hint: { fontSize: 13, lineHeight: 18, fontWeight: '500' },
  notice: { borderRadius: 16, padding: 14 },
  noticeHeader: { flexDirection: 'row', alignItems: 'center' },
  noticeTitle: { flexShrink: 1, fontSize: 15, lineHeight: 20, fontWeight: '700' },
  installing: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44
  },
  textButton: { marginTop: 8, paddingVertical: 10, alignItems: 'center' },
  textButtonLabel: { fontSize: 15, fontWeight: '800' }
})
