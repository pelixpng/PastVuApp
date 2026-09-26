import { FC, useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  findNodeHandle,
  Image,
  LayoutChangeEvent,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '@react-navigation/native'

// react-native-view-shot is linked on iOS only. On Android the panorama's WebView draws on the
// GPU and a view snapshot leaves it black, so the PixelCopy module below is used there and the
// library is excluded from the Android build (package.json, expo.autolinking.android.exclude).
// Required lazily: its native spec is resolved at import time and would throw where it is absent.
const captureRef: typeof import('react-native-view-shot').captureRef | null =
  Platform.OS === 'ios' ? require('react-native-view-shot').captureRef : null
import { FontAwesome5 } from '../ui/icons'
import { MaterialIcons } from '../ui/icons'
import { StreetViewPanorama } from '../streetView/StreetViewPanorama'
import { StreetViewTarget } from '../../services/streetView'
import { MyButton } from '../ui/buttons/MyButton'
import { Spacer } from '../ui/Spacer'
import { saveLocalImage } from '../../utils/getPhoto'
import { t } from '../../i18n'
import ScreenCapture from '../../../modules/screen-capture'
import CameraLenses from '../../../modules/camera-lenses'
import { localeTag } from '../../i18n'

export type ComparePhoto = {
  uri: string
  /** Year (or range) as PastVu prints it, e.g. "1928". */
  year: string
  width?: number
  height?: number
}

/** Where "today" comes from: the device camera, or a Google Street View panorama. */
export type CompareMode = 'camera' | 'streetView'

/**
 * A camera choice the user can tap: a physical lens on iOS, or a zoom step on Android.
 *
 * expo-camera lists real lenses only on iOS (`getAvailableLensesAsync`), and gives no zoom
 * factors, so labels go by lens type. Android exposes just a 0..1 fraction of the maximum zoom,
 * so the second step there is a digital crop of roughly 2x, not a second lens.
 */
type Lens = { label: string; lens?: string; zoom?: number; order?: number }

const ANDROID_LENSES: Lens[] = [
  { label: '1', zoom: 0 },
  { label: '2', zoom: 0.33 },
]

/** "0,5" / "0.5", "1", "5": the way the system camera prints zoom factors. */
const factorLabel = (factor: number) =>
  new Intl.NumberFormat(localeTag(), { maximumFractionDigits: 1 }).format(factor)

/**
 * iOS lenses, from the local CameraLenses module: physical back lenses with the zoom factors
 * AVFoundation switches at, named exactly as expo-camera expects in `selectedLens`. Only lenses
 * expo-camera itself lists are offered, so a name mismatch can never leave a dead button.
 */
const iosLenses = (available: string[]): Lens[] => {
  const lenses: Lens[] = []
  for (const lens of (CameraLenses?.getBackLenses() ?? []).filter(l => available.includes(l.name))) {
    lenses.push({ label: factorLabel(lens.factor), lens: lens.name, zoom: 0, order: lens.factor })
    // A native-resolution crop (2x on a 48 MP wide) counts as a lens, as in the system camera.
    // expo-camera maps `zoom` exponentially, so invert that to land on the exact factor.
    for (const crop of lens.cropFactors) {
      const factor = lens.factor * crop
      if (factor <= 1 || lens.maxZoom <= 1) continue
      lenses.push({
        label: factorLabel(factor),
        lens: lens.name,
        zoom: Math.min(1, Math.log(crop) / Math.log(lens.maxZoom)),
        order: factor,
      })
    }
  }
  const seen = new Set<string>()
  return lenses
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .filter(lens => !seen.has(lens.label) && seen.add(lens.label) !== undefined)
}

type Props = {
  photo: ComparePhoto
  initialMode: CompareMode
  /** Street View is offered only when Google has a panorama here; otherwise camera only. */
  target?: StreetViewTarget | null
  panoramaYear?: number
  /**
   * `cover` (phone): full-width boxes as tall as the photo's aspect ratio needs, capped at half
   * the area, so a wide photo is never cropped and only a tall one loses a little top and bottom.
   * `contain` (tablet): the photo is shown whole, fitted into half of the area at its own aspect
   * ratio, so a tall photo gets narrower instead. Either way the "today" box is identical and the
   * pair sits centred on the app background.
   */
  fit?: 'cover' | 'contain'
}

/**
 * Then-and-now: the historical photo above today's view, which is either the live
 * camera or a Street View panorama. The camera shutter freezes a shot in place of the preview,
 * and Save writes the pair to the gallery as one image. The two boxes are always the same size.
 */
export const CompareView: FC<Props> = ({
  photo,
  initialMode,
  target,
  panoramaYear,
  fit = 'cover',
}) => {
  const { bottom } = useSafeAreaInsets()
  const { colors } = useTheme()
  const collage = useRef<View>(null)
  const camera = useRef<CameraView>(null)
  const [mode, setMode] = useState<CompareMode>(initialMode)
  const [shot, setShot] = useState<string | null>(null)
  const [cameraReady, setCameraReady] = useState(false)
  const [lenses, setLenses] = useState<Lens[]>(Platform.OS === 'android' ? ANDROID_LENSES : [])
  const [lensIndex, setLensIndex] = useState(Platform.OS === 'android' ? 0 : -1)
  const [busy, setBusy] = useState(false)
  const [permission, requestPermission] = useCameraPermissions()
  const [area, setArea] = useState({ width: 0, height: 0 })
  const onLayout = (e: LayoutChangeEvent) => setArea(e.nativeEvent.layout)

  // Ask as soon as the camera is shown, not on the first shutter press.
  useEffect(() => {
    if (mode === 'camera' && permission && !permission.granted && permission.canAskAgain) {
      requestPermission()
    }
  }, [mode, permission, requestPermission])

  const onCameraReady = async () => {
    setCameraReady(true)
    if (Platform.OS !== 'ios' || lenses.length > 0) return
    try {
      const available = (await camera.current?.getAvailableLensesAsync()) ?? []
      const found = iosLenses(available)
      setLenses(found)
      setLensIndex(Math.max(0, found.findIndex(l => l.order === 1)))
    } catch (error) {
      console.error('getAvailableLenses failed', error)
    }
  }

  const shoot = async () => {
    if (busy || !cameraReady) return
    setBusy(true)
    try {
      const picture = await camera.current?.takePictureAsync({ quality: 0.9 })
      if (picture) setShot(picture.uri)
    } catch (error) {
      console.error('takePicture failed', error)
      Alert.alert(t('common.error'), t('photo.saveError'))
    } finally {
      setBusy(false)
    }
  }

  const save = async () => {
    if (busy) return
    setBusy(true)
    try {
      // A snapshot of the composed pair rather than a re-download: it is exactly what the user
      // sees, badges included. On Android the panorama's WebView draws on the GPU and a plain
      // view snapshot leaves it black, hence the PixelCopy module.
      const tag = ScreenCapture ? findNodeHandle(collage.current) : null
      let uri: string
      if (ScreenCapture && tag) {
        uri = await ScreenCapture.captureView(tag)
      } else if (captureRef) {
        uri = await captureRef(collage, { format: 'jpg', quality: 0.92 })
      } else {
        throw new Error('No snapshot module on this platform')
      }
      await saveLocalImage(uri)
    } catch (error) {
      console.error('saveCollage failed', error)
      Alert.alert(t('common.error'), t('photo.saveError'))
    } finally {
      setBusy(false)
    }
  }

  const switchMode = (next: CompareMode) => {
    setMode(next)
    setShot(null)
  }

  const oldPhoto = (
    <>
      {/* Always whole: the old photo is the point of the comparison, so it is never cropped. */}
      <Image source={{ uri: photo.uri }} style={s.fill} resizeMode="contain" />
      <Badge text={photo.year} />
    </>
  )

  // The camera half carries the current year, mirroring the panorama's shooting year.
  const thisYear = String(new Date().getFullYear())
  let today
  if (mode === 'streetView') {
    today = target ? (
      <StreetViewPanorama target={target} year={panoramaYear} />
    ) : (
      // Google has no panorama within its search distance of this point: say so instead of
      // hiding the mode, so the user knows it was checked.
      <View style={s.denied}>
        <FontAwesome5 name="street-view" size={40} color={colors.textThird} />
        <Spacer height={12} />
        <Text style={[s.deniedText, { color: colors.textSecond }]}>{t('streetView.noPanorama')}</Text>
      </View>
    )
  } else if (shot) {
    today = (
      <>
        <Image source={{ uri: shot }} style={s.fill} resizeMode="cover" />
        <Badge text={thisYear} />
      </>
    )
  } else if (permission?.granted) {
    today = (
      <>
        <CameraView
          ref={camera}
          style={s.fill}
          facing="back"
          mute
          selectedLens={lenses[lensIndex]?.lens}
          zoom={lenses[lensIndex]?.zoom ?? 0}
          onCameraReady={onCameraReady}
        />
        <Badge text={thisYear} />
      </>
    )
  } else if (permission && !permission.canAskAgain) {
    today = (
      <View style={s.denied}>
        <MaterialIcons name="no-photography" size={40} color={colors.textThird} />
        <Spacer height={12} />
        <Text style={[s.deniedText, { color: colors.textSecond }]}>{t('compare.cameraDenied')}</Text>
        <Spacer height={16} />
        <MyButton title={t('compare.openSettings')} func={() => Linking.openSettings()} />
      </View>
    )
  } else {
    today = (
      <View style={s.denied}>
        <ActivityIndicator color="white" />
      </View>
    )
  }

  // The box both halves share, derived from the photo's aspect ratio.
  const ratio = photo.width && photo.height ? photo.width / photo.height : 4 / 3
  const halfHeight = area.height / 2
  const box =
    fit === 'cover'
      ? { width: area.width, height: Math.min(area.width / ratio, halfHeight) }
      : area.width / ratio <= halfHeight
        ? { width: area.width, height: area.width / ratio }
        : { width: halfHeight * ratio, height: halfHeight }

  const canSave = (mode === 'streetView' && target !== null && target !== undefined) || shot !== null
  const showShutter = mode === 'camera' && !shot

  return (
    <View style={[s.container, { backgroundColor: colors.backgroundApp }]}>
      <View style={s.area} onLayout={onLayout}>
        {area.height > 0 && (
          <View ref={collage} collapsable={false}>
            <View style={[box, s.box]}>{oldPhoto}</View>
            <View style={[box, s.box]}>{today}</View>
          </View>
        )}
      </View>
      <View style={[s.bar, { paddingBottom: bottom + 12, backgroundColor: colors.backgroundApp }]}>
        <View
          style={[
            s.modes,
            // Pinned to the left in shutter mode so the shutter can sit at the screen centre.
            showShutter && s.modesPinned,
            { backgroundColor: colors.baseThird },
          ]}>
          <ModeButton active={mode === 'camera'} onPress={() => switchMode('camera')}>
            <MaterialIcons
              name="photo-camera"
              size={20}
              color={mode === 'camera' ? colors.basePrimary : colors.textThird}
            />
          </ModeButton>
          <ModeButton active={mode === 'streetView'} onPress={() => switchMode('streetView')}>
            <FontAwesome5
              name="street-view"
              size={18}
              color={mode === 'streetView' ? colors.basePrimary : colors.textThird}
            />
          </ModeButton>
        </View>
        {!showShutter && <Spacer width={12} />}
        {showShutter ? (
          <>
            <View style={s.shutterArea}>
              <TouchableOpacity
                accessibilityLabel={t('compare.shoot')}
                disabled={!cameraReady || busy}
                onPress={shoot}
                style={[s.shutter, { borderColor: colors.textThird, opacity: cameraReady ? 1 : 0.4 }]}>
                <View style={[s.shutterInner, { backgroundColor: colors.textFirst }]} />
              </TouchableOpacity>
            </View>
            {lenses.length > 1 && (
              <View style={s.lensRow}>
                {lenses.map((lens, index) => (
                  <TouchableOpacity
                    key={lens.label}
                    onPress={() => setLensIndex(index)}
                    style={[
                      s.lensChip,
                      { backgroundColor: colors.baseThird },
                      index === lensIndex && { backgroundColor: colors.basePrimary },
                    ]}>
                    <Text
                      style={[
                        s.lensText,
                        { color: index === lensIndex ? 'white' : colors.textSecond },
                      ]}>
                      {lens.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        ) : (
          <>
            {mode === 'camera' && (
              <>
                <TouchableOpacity
                  accessibilityLabel={t('compare.retake')}
                  onPress={() => setShot(null)}
                  style={[s.iconButton, { backgroundColor: colors.baseThird }]}>
                  <MaterialIcons name="replay" size={22} color={colors.textFirst} />
                </TouchableOpacity>
                <Spacer width={12} />
              </>
            )}
            {canSave && <MyButton title={t('streetView.save')} func={save} fullWidth />}
          </>
        )}
      </View>
    </View>
  )
}

const Badge: FC<{ text: string }> = ({ text }) => (
  <View style={s.badge}>
    <Text style={s.badgeText}>{text}</Text>
  </View>
)

const ModeButton: FC<{ active: boolean; onPress: () => void; children: React.ReactNode }> = ({
  active,
  onPress,
  children,
}) => {
  const { colors } = useTheme()
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[s.modeButton, active && { backgroundColor: colors.backgroundApp }]}>
      {children}
    </TouchableOpacity>
  )
}

const s = StyleSheet.create({
  container: { flex: 1 },
  area: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  box: { backgroundColor: 'black', overflow: 'hidden' },
  fill: { width: '100%', height: '100%' },
  denied: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: 'black',
  },
  deniedText: { fontSize: 14, lineHeight: 20, fontWeight: '500', textAlign: 'center' },
  bar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12 },
  modes: { flexDirection: 'row', borderRadius: 12, padding: 3, height: 44 },
  modesPinned: { position: 'absolute', left: 16, top: 12 },
  modeButton: {
    width: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterArea: { flex: 1, alignItems: 'center' },
  // Same 44 pt as the buttons it replaces, so the bar keeps its height across modes.
  shutter: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterInner: { width: 34, height: 34, borderRadius: 17 },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Pinned to the right of the shutter, mirroring the mode toggle on the left.
  lensRow: {
    position: 'absolute',
    right: 16,
    top: 12,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lensChip: {
    minWidth: 32,
    height: 32,
    paddingHorizontal: 6,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lensText: { fontSize: 12, lineHeight: 16, fontWeight: '700' },
  badge: {
    position: 'absolute',
    left: 12,
    bottom: 36,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  badgeText: { color: 'white', fontSize: 13, lineHeight: 20, fontWeight: '700' },
})
