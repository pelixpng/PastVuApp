import { FC, useEffect, useRef, useState } from 'react'
import { Linking, StyleSheet, Text, View } from 'react-native'
import { WebView } from 'react-native-webview'
import { useTheme } from '@react-navigation/native'
import { FontAwesome5 } from '../ui/icons'
import { t } from '../../i18n'
import {
  googleMapsUrl,
  isStreetViewConfigured,
  panoramaHtml,
  STREET_VIEW_ORIGIN,
  StreetViewTarget,
} from '../../services/streetView'
import { MyButton } from '../ui/buttons/MyButton'
import { Spacer } from '../ui/Spacer'
import { LoadingCover } from '../ui/LoadingCover'

type Props = {
  target: StreetViewTarget
  year?: number
}

const openInGoogleMaps = (target: StreetViewTarget) => Linking.openURL(googleMapsUrl(target))

/** How long the cover stays after the page has loaded, while the embed draws its first view. */
const SETTLE_MS = 300

/**
 * The panorama itself. Fills its parent.
 *
 * Without a configured key it shows an explanation and the Google Maps link instead of a blank
 * WebView, so the screen is still useful on a build without secrets.
 */
export const StreetViewPanorama: FC<Props> = ({ target, year }) => {
  const { colors } = useTheme()
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  const settle = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(settle.current), [])

  if (!isStreetViewConfigured() || failed) {
    return (
      <View style={[s.fallback, { backgroundColor: colors.backgroundApp }]}>
        <FontAwesome5 name="street-view" size={44} color={colors.textThird} />
        <Spacer height={12} />
        <Text style={[s.fallbackText, { color: colors.textSecond }]}>
          {failed ? t('streetView.loadError') : t('streetView.notConfigured')}
        </Text>
        <Spacer height={20} />
        <MyButton title={t('streetView.openInMaps')} func={() => openInGoogleMaps(target)} />
      </View>
    )
  }

  return (
    <View style={s.container}>
      <WebView
        style={s.webview}
        originWhitelist={['*']}
        source={{ html: panoramaHtml(target), baseUrl: STREET_VIEW_ORIGIN }}
        javaScriptEnabled
        domStorageEnabled
        allowsInlineMediaPlayback
        scrollEnabled={false}
        bounces={false}
        // The embed draws its first view a moment after its page has loaded, on black.
        onLoadEnd={() => {
          settle.current = setTimeout(() => setLoading(false), SETTLE_MS)
        }}
        onError={() => setFailed(true)}
      />
      {loading && <LoadingCover />}
      {year !== undefined && (
        <View style={s.badge}>
          <Text style={s.badgeText}>{t('streetView.shotIn', { year })}</Text>
        </View>
      )}
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  webview: { flex: 1, backgroundColor: 'black' },
  // Bottom left, above the embed's footer strip: its address card is top left, its controls run
  // down the right edge and the Google logo sits bottom centre, so this corner stays clear.
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
  fallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  fallbackText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
    textAlign: 'center',
  },
})
